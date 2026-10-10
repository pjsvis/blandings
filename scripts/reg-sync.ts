#!/usr/bin/env bun
/**
 * reg-sync.ts — detect (and with --fix, repair) drift between registry
 * directories and their JSONL indexes; maintain OKF frontmatter
 * (`type` + `callsign`) across the corpus (ADR-019; brief
 * 2026-08-29-brief-okf-callsign-migration).
 *
 * Usage:
 *   bun scripts/reg-sync.ts <registry>   # check one: briefs|debriefs|decisions|playbooks
 *   bun scripts/reg-sync.ts --all        # check all
 *   bun scripts/reg-sync.ts --all --fix  # add MISSING, drop STALE, rewrite index,
 *                                        # ensure frontmatter, lift callsigns
 *
 * Exit code 1 on any drift, 0 when clean.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

interface RegistryDef {
  dir: string;
  index: string;
  defaultStatus: string;
  exclude?: string[];
  /** OKF frontmatter `type` value and callsign prefix for this tier. */
  fmType: string;
  csPrefix: string;
  /** Resolution-only tier (ADR-052): archived work — the resolver
   *  reads it, the launcher's search channel never does. The drift
   *  test pins each list against its own consumer. */
  archive?: boolean;
}

// Exported for the drift test (BRF-VALIDATED-SILCROWS P-0): root.ts's
// TIER_REGISTRIES must stay 1:1 with this config — two lists that must
// agree drifted once (advisories, 2026-09-24); the test makes the next
// drift loud, not silent.
export const REGISTRIES: Record<string, RegistryDef> = {
  briefs: { dir: "briefs", index: "INDEX.jsonl", defaultStatus: "open", exclude: ["index.md"], fmType: "Brief", csPrefix: "BRF" },
  debriefs: { dir: "debriefs", index: "INDEX.jsonl", defaultStatus: "done", exclude: ["index.md"], fmType: "Debrief", csPrefix: "DBF" },
  decisions: { dir: "decisions", index: "INDEX.jsonl", defaultStatus: "Proposed", exclude: ["TEMPLATE.md", "index.md"], fmType: "ADR", csPrefix: "ADR" },
  playbooks: { dir: "playbooks", index: "REGISTRY.jsonl", defaultStatus: "canonical", exclude: ["index.md"], fmType: "Playbook", csPrefix: "PLY" },
  // advisories: deadpan AI-HR dispatches for reader classes by persona
  // (capability-named, not deficit-named — the i811 policy in microcosm).
  // The manual (AI-HR-MANUAL.md) is the tier's constitution, excluded
  // from the dispatch index like TEMPLATE.md is excluded from decisions.
  advisories: { dir: "advisories", index: "INDEX.jsonl", defaultStatus: "open", exclude: ["index.md", "AI-HR-MANUAL.md"], fmType: "Advisory", csPrefix: "ADV" },
  // .archive/briefs (ADR-052): the permanent record — settled briefs,
  // reg-sync maintained, resolver-read. Search stays the work queue;
  // resolution becomes the whole citable silo, live and settled.
  ".archive/briefs": { dir: ".archive/briefs", index: "INDEX.jsonl", defaultStatus: "done", exclude: ["index.md"], fmType: "Brief", csPrefix: "BRF", archive: true },
};

export interface Entry {
  file: string;
  date: string;
  status: string;
  summary: string;
  meta?: Record<string, unknown>;
  /** Durable human code (silo-mnemonics); frontmatter is the source of
   *  truth, the registry the fast index. Absent pre-migration. */
  callsign?: string;
}

/** The brief vocabulary as the registry stores it. Wider than
 *  {open, in progress, done} since 2026-10-05: `parked` and `rejected`
 *  are words the brief playbook itself uses (`Parked — gated on <gate>`),
 *  `landed` is the archive's word for done, and `draft`/`proposed` are the
 *  corpus's words for a brief not yet started — both already recorded as
 *  `open`, so the entry documents behaviour rather than changing it. A map
 *  narrower than the vocabulary silently reported every parked brief as
 *  `open` — the defect that let a stale index row sit unnoticed. */
const BRIEF_STATUS: Record<string, string> = {
  open: "open",
  "in progress": "in_progress",
  done: "done",
  landed: "done",
  parked: "parked",
  rejected: "rejected",
  draft: "open",
  proposed: "open",
};

/** The decisions vocabulary (ADR-025's lifecycle plus the abort). */
const DECISION_STATUS: Record<string, string> = {
  proposed: "Proposed",
  accepted: "Accepted",
  superseded: "Superseded",
  aborted: "Aborted",
};

/** The declared status word: the FIRST word of the `**Status:**` line,
 *  lowercased — so `Done — shipped 2026-10-05 (abc123)`,
 *  `Aborted (2026-08-30)` and `Parked (Pi-side spike)` all resolve to
 *  their word. `in progress` is the one two-word entry, so it is matched
 *  before the split — a vocabulary key the parser cannot produce is a trap,
 *  not a status. Empty when the document declares none. Pure. */
export function statusWord(content: string): string {
  const raw = content.match(/\*\*Status:\*\*\s*(.+)/)?.[1]?.trim() ?? "";
  if (raw.toLowerCase().startsWith("in progress")) return "in progress";
  return raw.split(/[\s—–(\[]/)[0]!.toLowerCase();
}

/** A tier's status vocabulary, or null when the tier's statuses are
 *  fixed by definition. The archive is fixed by LOCATION, not by the
 *  body's word: a brief in `.archive/briefs` is settled (ADR-052), so
 *  five archived briefs whose bodies still say `Open`/`Draft` are not
 *  drift — the archive is the truth about them. A debrief is done and a
 *  playbook canonical, likewise. Pure. */
export function statusVocabulary(registry: string): Record<string, string> | null {
  if (registry === "briefs") return BRIEF_STATUS;
  if (registry === "decisions") return DECISION_STATUS;
  return null;
}

/** A status word → the value the registry stores, or null when the word
 *  is not in the tier's vocabulary. Null is a finding, not a fallback:
 *  an unrecognised status must be reported, because silently storing
 *  `open` for it is how a row drifts out of agreement without anyone
 *  noticing. Pure. */
export function statusFor(word: string, registry: string): string | null {
  return statusVocabulary(registry)?.[word] ?? null;
}

// ── Frontmatter (pure) ────────────────────────────────────────────────

/** Split a document into frontmatter body and rest. Returns null fm when
 *  the document does not open with a `---` fence. Pure. */
export function splitFrontmatter(content: string): { fm: string | null; rest: string } {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: null, rest: content };
  return { fm: m[1]!, rest: content.slice(m[0].length) };
}

/** One-line `key: value` read from a frontmatter body. No YAML dependency
 *  (parity with root.ts frontmatterValue). Pure. */
export function fmValue(fm: string, key: string): string | null {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return m ? m[1]!.trim().replace(/^["']|["']$/g, "") : null;
}

/** Ensure `type` and `callsign` keys exist in a document's frontmatter,
 *  prepending a fence when absent and inserting missing keys after the
 *  opening one. Never touches existing keys — assigned callsigns are
 *  never re-derived (silo-mnemonics: resolution, not derivation).
 *  Returns the new content, or null when already conformant. Pure. */
export function ensureFrontmatter(content: string, type: string, callsign: string): string | null {
  const { fm, rest } = splitFrontmatter(content);
  if (fm === null) {
    return `---\ntype: ${type}\ncallsign: ${callsign}\n---\n\n${rest}`;
  }
  const hasType = fmValue(fm, "type") !== null;
  const hasCs = fmValue(fm, "callsign") !== null;
  if (hasType && hasCs) return null;
  const ins: string[] = [];
  if (!hasType) ins.push(`type: ${type}`);
  if (!hasCs) ins.push(`callsign: ${callsign}`);
  return `---\n${ins.join("\n")}\n${fm}\n---\n${rest}`;
}

/** Token words that carry no identity: connectives and the tier's own
 *  nouns (a "playbook" inside playbooks/ says nothing). */
const STOPWORDS = new Set(
  ("a an the and or of to in on for with via not no is are as at by from into over under " +
    "playbook playbooks").split(" "),
);

/** Bootstrap a document's callsign from its filename: tier prefix + the
 *  first ≤2 significant slug tokens, ADRs appending their zero-padded
 *  sequence. Deterministic; collision suffixing happens at assignment.
 *  (silo-mnemonics: run once per document, never re-derived.) Pure. */
export function bootstrapCallsign(file: string, prefix: string): string {
  let stem = file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const seq = stem.match(/^(\d+)-/);
  if (seq) stem = stem.slice(seq[0].length);
  stem = stem.replace(/^(brief|decision|debrief)-/, "");
  const tokens = stem
    .split("-")
    .filter((t) => t.length > 0 && !STOPWORDS.has(t))
    .slice(0, 2)
    .map((t) => t.toUpperCase());
  const base = tokens.length > 0 ? [prefix, ...tokens].join("-") : `${prefix}-DOC`;
  return seq ? `${base}-${String(Number(seq[1])).padStart(3, "0")}` : base;
}

/** Assign a fresh callsign avoiding the taken set: base, then -2, -3, …
 *  First-come keeps the clean form; order is the caller's (registries in
 *  fixed order, files sorted). Pure. */
export function avoidingCollisions(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const c = `${base}-${n}`;
    if (!taken.has(c)) return c;
  }
}

/** A document's effective callsign: frontmatter's if assigned (never
 *  re-derived), else null until the migration assigns one. Pure. */
export function docCallsign(content: string): string | null {
  const { fm } = splitFrontmatter(content);
  return fm ? fmValue(fm, "callsign") : null;
}

/** Group per-file callsigns; return any callsign claimed by more than one
 *  file — the duplicate-callsign lint (ADR-025 clause 4). Frontmatter is
 *  truth; a collision is unfiixable (a human renames), never silently
 *  first-wins. Callsign-less docs carry no identity and don't collide. Pure. */
export function findCallsignCollisions(records: { file: string; callsign?: string }[]): { callsign: string; files: string[] }[] {
  const byCallsign = new Map<string, string[]>();
  for (const r of records) {
    if (!r.callsign) continue;
    const arr = byCallsign.get(r.callsign);
    if (arr) arr.push(r.file);
    else byCallsign.set(r.callsign, [r.file]);
  }
  return [...byCallsign.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([callsign, files]) => ({ callsign, files: [...files].sort() }));
}

// ── Registry derivation (unchanged semantics) ──────────────────────────

function readIndex(indexPath: string): Entry[] {
  let raw: string;
  try {
    raw = readFileSync(indexPath, "utf8");
  } catch {
    return [];
  }
  return raw
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l, i) => {
      try {
        return JSON.parse(l) as Entry;
      } catch {
        console.warn(`  WARN: unparseable line ${i + 1} in ${indexPath} — skipping`);
        return null;
      }
    })
    .filter((e): e is Entry => e !== null);
}

function listDocs(dir: string, exclude: string[] = []): string[] {
  try {
    return readdirSync(dir).filter((f) => f.endsWith(".md") && !exclude.includes(f)).sort();
  } catch {
    return [];
  }
}

/** Pull `date:` frontmatter or a `**Date:**` line; fall back to file mtime. */
/** The date the document DECLARES (frontmatter `date:` or a `**Date:**`
 *  line), or null when it declares none. Pure. Distinct from
 *  `deriveDate`, which also reads the FILENAME — and an mtime is not a claim
 *  the document makes, so it must not be compared as one. */
export function authoredDate(content: string): string | null {
  const fm = content.match(/^---\n[\s\S]*?date:\s*(\d{4}-\d{2}-\d{2})/m);
  if (fm) return fm[1]!;
  const bold = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  return bold ? bold[1]! : null;
}

/** The date the FILENAME claims (`YYYY-MM-DD-…`), or null. Pure. The name is
 *  a claim the author made, not a measurement about a host: it travels with
 *  the bytes and is the only date that survives a copy (BRF-DATE-INVARIANT). */
export function nameDate(path: string): string | null {
  const m = basename(path).match(/^(\d{4}-\d{2}-\d{2})-/);
  return m ? m[1]! : null;
}

/** The document's declared date: content first, then the filename. NEVER the
 *  mtime — an mtime is a host observation and a persisted index row must not
 *  depend on where the check ran. `""` when nothing declares a date. */
function deriveDate(content: string, path: string): string {
  return authoredDate(content) ?? nameDate(path) ?? "";
}

function deriveStatus(content: string, def: RegistryDef, registry: string): string {
  return statusFor(statusWord(content), registry) ?? def.defaultStatus;
}

function deriveSummary(content: string, file: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1]!.replace(/^Decision:\s*/i, "").replace(/^Brief:\s*/i, "").trim();
  return file.replace(/\.md$/, "");
}

// ── Frontmatter migration (the corpus pass) ────────────────────────────

interface MigrationResult {
  /** registry name → (file → callsign), for registry lift. */
  perRegistry: Map<string, Map<string, string>>;
  /** Docs whose frontmatter needed (and in fix mode, received) keys. */
  fmDrift: number;
}

/** Migrate frontmatter across all tiers. Phase A collects assigned
 *  callsigns (frontmatter is truth); phase B assigns bootstraps to the
 *  remainder, deterministically, avoiding collisions globally. In check
 *  mode nothing is written — drift is counted only. */
function migrateCorpus(fix: boolean): MigrationResult {
  const perRegistry = new Map<string, Map<string, string>>();
  const taken = new Set<string>();
  const pending: { name: string; def: RegistryDef; file: string; path: string; content: string }[] = [];

  for (const [name, def] of Object.entries(REGISTRIES)) {
    for (const file of listDocs(join(ROOT, def.dir), def.exclude)) {
      const path = join(ROOT, def.dir, file);
      const content = readFileSync(path, "utf8");
      const cs = docCallsign(content);
      if (cs) taken.add(cs);
      else pending.push({ name, def, file, path, content });
    }
  }

  let fmDrift = 0;
  const writes: { path: string; content: string }[] = [];
  for (const doc of pending) {
    const base = bootstrapCallsign(doc.file, doc.def.csPrefix);
    const cs = avoidingCollisions(base, taken);
    taken.add(cs);
    const next = ensureFrontmatter(doc.content, doc.def.fmType, cs);
    if (next !== null) {
      fmDrift++;
      if (fix) {
        writes.push({ path: doc.path, content: next });
        doc.content = next;
      }
    }
  }

  // Docs already carrying frontmatter may still lack type/callsign keys
  // (debriefs predate the migration; the keys land now, nothing clobbers).
  for (const [name, def] of Object.entries(REGISTRIES)) {
    const map = new Map<string, string>();
    for (const file of listDocs(join(ROOT, def.dir), def.exclude)) {
      const path = join(ROOT, def.dir, file);
      let content = readFileSync(path, "utf8");
      const pendingWrite = fix ? writes.find((w) => w.path === path) : undefined;
      if (pendingWrite) content = pendingWrite.content;
      let cs = docCallsign(content);
      if (!cs) continue; // unreachable post-fix; check mode counts via fmDrift
      const ensured = ensureFrontmatter(content, def.fmType, cs);
      if (ensured !== null) {
        fmDrift++;
        if (fix) {
          writes.push({ path, content: ensured });
          content = ensured;
          cs = docCallsign(content) ?? cs;
        }
      }
      // Built in BOTH modes: check mode needs the map to compare the
      // registry's callsign against frontmatter, and a map that exists only
      // while fixing cannot report drift — the 2026-10-05 finding.
      map.set(file, cs);
    }
    perRegistry.set(name, map);
  }

  if (fix) {
    const seen = new Set<string>();
    for (const w of writes) {
      if (seen.has(w.path)) continue;
      seen.add(w.path);
      writeFileSync(w.path, w.content);
    }
  }
  if (fmDrift > 0) {
    console.log(`  frontmatter: ${fmDrift} doc(s) ${fix ? "ensured" : "missing"} type/callsign`);
  }
  return { perRegistry, fmDrift };
}

// ── Index sync (membership + callsign lift) ────────────────────────────

function entryFrom(
  file: string,
  def: RegistryDef,
  registry: string,
  content: string,
  path: string,
  callsign?: string,
): Entry {
  const entry: Entry = {
    file,
    date: deriveDate(content, path),
    status: deriveStatus(content, def, registry),
    summary: deriveSummary(content, file),
    meta: {},
  };
  if (callsign) entry.callsign = callsign;
  return entry;
}

function deriveEntry(dir: string, file: string, def: RegistryDef, registry: string, callsign?: string): Entry {
  const path = join(dir, file);
  return entryFrom(file, def, registry, readFileSync(path, "utf8"), path, callsign);
}

/** The fields the registry MIRRORS from the document, compared. Membership
 *  alone is not sync: a brief flipped to Done keeps its old row forever if
 *  only the file list is checked (found 2026-10-05 — BRF-MATH-GLYPHS read
 *  `done` on disk and `open` in the index while reg-sync said "All
 *  registries in sync"). Returns one human-readable diff per field, empty
 *  when the row matches. Pure — the caller re-derives `truth` and applies
 *  the result.
 *
 *  Two refusals, both learned by running it:
 *  - `haveCallsign: false` means frontmatter carries none (the document is
 *    already counted as frontmatter drift), so the registry's copy is left
 *    alone rather than cleared.
 *  - `dateAuthored: false` means neither the content nor the filename declares
 *    a date, so the registry's stored value is left alone rather than cleared
 *    to an empty string. A claim (content or name) is a claim; an mtime is not,
 *    and is never read.
 *
 *  Summary is deliberately NOT compared: it is derived from the H1 at
 *  add-time, but the playbooks registry carries hand-written summaries and
 *  the briefs mix both, so comparing it would rewrite authored prose
 *  rather than mirror a claim. Same for `status` when the document's word
 *  is outside the tier's vocabulary — that is reported as UNKNOWN by the
 *  caller, not silently corrected. */
export function derivedDrift(
  stored: Entry,
  truth: Entry,
  opts: { haveCallsign: boolean; dateAuthored: boolean },
): string[] {
  const diffs: string[] = [];
  if (stored.status !== truth.status) diffs.push(`status ${stored.status} → ${truth.status}`);
  if (opts.dateAuthored && stored.date !== truth.date) {
    diffs.push(`date ${stored.date} → ${truth.date}`);
  }
  if (opts.haveCallsign && (stored.callsign ?? null) !== (truth.callsign ?? null)) {
    diffs.push(`callsign ${stored.callsign ?? "—"} → ${truth.callsign ?? "—"}`);
  }
  return diffs;
}

function syncOne(name: string, fix: boolean, csMap: Map<string, string>): { missing: number; stale: number; fieldDrift: number; unknown: number; indexDoc: number; collisions: number } {
  const def = REGISTRIES[name]!;
  const dir = join(ROOT, def.dir);
  const indexPath = join(dir, def.index);
  const entries = readIndex(indexPath);
  const docs = listDocs(dir, def.exclude);
  const indexed = new Set(entries.map((e) => e.file));

  // Collision lint (ADR-025 clause 4): a callsign resolves to exactly one
  // doc within a registry. Frontmatter is truth — group by callsign; any
  // group with >1 file is a collision, loudly unfiixable (a human renames,
  // sync never silently first-wins). Callsign-less docs don't collide.
  const collisions = findCallsignCollisions(
    docs.map((f) => ({ file: f, callsign: docCallsign(readFileSync(join(dir, f), "utf8")) })),
  );
  for (const c of collisions) {
    console.log(`  ${name}: COLLISION ${c.callsign} ← ${c.files.join(", ")}`);
  }

  const missing = docs.filter((f) => !indexed.has(f));
  const stale = entries.filter((e) => !docs.includes(e.file));

  for (const f of missing) {
    const entry = fix ? deriveEntry(dir, f, def, name, csMap.get(f)) : null;
    console.log(`  ${name}: MISSING ${f}${fix ? ` → added (${entry!.status}, ${entry!.date})` : ""}`);
    if (entry) entries.push(entry);
  }
  const staleFiles = new Set(stale.map((e) => e.file));
  for (const e of stale) {
    console.log(`  ${name}: STALE ${e.file}${fix ? " → removed" : ""}`);
  }

  // Derived-field reconciliation: the document is truth and the registry
  // mirrors it — status, date, summary and callsign all derive from the
  // file. Membership is checked above; this is the half that was missing.
  let fieldDrift = 0;
  // An unrecognised status word is reported, never mapped: storing `open`
  // for a word the map does not know is exactly how the row drifted. It is
  // a lint rather than drift, though — the gap is the vocabulary's, not the
  // document's, and failing the gate on it would force either a silent map
  // entry or ten content edits. Loud, counted, separate.
  let unknown = 0;
  let noDate = 0;
  for (const e of entries) {
    if (staleFiles.has(e.file)) continue;
    const cs = csMap.get(e.file);
    const content = readFileSync(join(dir, e.file), "utf8");
    const truth = entryFrom(e.file, def, name, content, join(dir, e.file), cs);
    const word = statusWord(content);
    if (statusVocabulary(name) !== null && word !== "" && statusFor(word, name) === null) {
      unknown++;
      console.log(`  ${name}: UNKNOWN STATUS ${e.file} — "${word}" is not in the tier vocabulary`);
      continue;
    }
    // A date is a CLAIM when the content declares it or the filename does.
    // An mtime is neither, so it is never written and never compared
    // (BRF-DATE-INVARIANT) — a persisted row must not depend on WHERE the
    // check ran.
    const opts = {
      haveCallsign: cs !== undefined,
      dateAuthored: authoredDate(content) !== null || nameDate(e.file) !== null,
    };
    if (truth.date === "") noDate++;
    const diffs = derivedDrift(e, truth, opts);
    if (diffs.length === 0) continue;
    fieldDrift++;
    if (fix) {
      // Only the fields that actually drifted are written. `summary` is
      // absent by design: it is never compared, so repairing a status must
      // not quietly replace a hand-written summary with the H1.
      if (e.status !== truth.status) e.status = truth.status;
      if (opts.dateAuthored && e.date !== truth.date) e.date = truth.date;
      if (opts.haveCallsign && e.callsign !== cs) e.callsign = cs;
    }
    console.log(`  ${name}: DRIFT ${e.file} — ${diffs.join(", ")}${fix ? " → corrected" : ""}`);
  }
  if (noDate > 0) {
    console.log(`  ${name}: ${noDate} doc(s) declare NO DATE — the row keeps its stored value; add a \`**Date:**\` or a date-first filename`);
  }

  const kept = entries.filter((e) => !staleFiles.has(e.file));
  if (fix) {
    if (missing.length || stale.length || fieldDrift > 0) {
      kept.sort((a, b) => a.file.localeCompare(b.file));
      writeFileSync(indexPath, kept.map((e) => JSON.stringify(e)).join("\n") + "\n");
      console.log(`  ${name}: index rewritten (${kept.length} entries)`);
    } else {
      console.log(`  ${name}: OK (0 missing, 0 stale)`);
    }
  } else if (missing.length || stale.length || fieldDrift > 0) {
    console.log(`  ${name}: ${missing.length} MISSING, ${stale.length} STALE, ${fieldDrift} DRIFTED`);
  } else {
    console.log(`  ${name}: OK (0 missing, 0 stale)`);
  }

  const indexDoc = syncIndexDoc(name, def, kept, fix);
  return { missing: missing.length, stale: stale.length, fieldDrift, unknown, indexDoc, collisions: collisions.length };
}

// ── Tier index.md export (ADR-019: generated, never hand-edited) ───────

/** Render a tier's `index.md` from its registry entries — the OKF-visible
 *  export. Deterministic: same entries, same bytes. Bare `.md` path tokens
 *  render as doc-refs in okuda; external OKF consumers get a table they
 *  can parse. Pure. */
export function renderIndexDoc(tier: string, entries: Entry[]): string {
  const rows = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file))
    .map((e) => `| ${e.date} | ${e.callsign ?? ""} | ${e.status} | ${e.summary.replace(/\|/g, "\\|")} | ${e.file} |`);
  return [
    "---",
    "type: Index",
    "generated: true",
    "---",
    "",
    `# ${tier} — silo index`,
    "",
    "Generated from the registry by `reg-sync --fix`; hand-edits are overwritten.",
    "",
    "| Date | Callsign | Status | Document | File |",
    "|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

/** Sync the generated tier index.md against its registry. Returns drift
 *  count (0 = current). */
function syncIndexDoc(name: string, def: RegistryDef, entries: Entry[], fix: boolean): number {
  const path = join(ROOT, def.dir, "index.md");
  const want = renderIndexDoc(name, entries);
  let have: string | null = null;
  try {
    have = readFileSync(path, "utf8");
  } catch {
    // absent — drift unless fix writes it
  }
  if (have === want) return 0;
  if (fix) {
    writeFileSync(path, want);
    console.log(`  ${name}: index.md ${have === null ? "generated" : "regenerated"} (${entries.length} rows)`);
  } else {
    console.log(`  ${name}: index.md ${have === null ? "MISSING" : "STALE"}`);
  }
  return 1;
}

// ── Main ────────────────────────────────────────────────────────────────

if (import.meta.main) {
  const args = process.argv.slice(2);
  const fix = args.includes("--fix");
  const all = args.includes("--all");
  const names = all || args.length === 0 ? Object.keys(REGISTRIES) : args.filter((a) => !a.startsWith("--"));

  console.log(`reg-sync ${fix ? "(fix mode)" : "(check mode)"} — ${names.join(", ")}`);
  const { perRegistry, fmDrift } = migrateCorpus(fix);
  let drift = fmDrift;
  let collisions = 0;
  let unknown = 0;
  for (const n of names) {
    const r = syncOne(n, fix, perRegistry.get(n) ?? new Map());
    drift += r.missing + r.stale + r.fieldDrift + r.indexDoc;
    collisions += r.collisions;
    unknown += r.unknown;
  }
  if (unknown > 0) {
    // Loud, not fatal: the documents are legible, the vocabulary is short.
    // Settling which words the registry stores is a corpus decision, not a
    // sync repair — named here, absorbed nowhere.
    console.log(`${unknown} unrecognised status word(s) — the tier vocabulary is incomplete (settle it, do not absorb it)`);
  }
  if (collisions > 0) {
    console.log(`${collisions} callsign collision(s) — unfiixable; rename a document's callsign (ADR-025 clause 4)`);
  }
  if (drift > 0) {
    console.log(`${drift} drift item(s) ${fix ? "repaired" : "found"} — run reg-list to review`);
    if (!fix) process.exitCode = 1;
  }
  if (collisions > 0) {
    process.exitCode = 1; // unfiixable in both modes — the loud gate
  }
  if (drift === 0 && collisions === 0) {
    console.log("All registries in sync");
  }
}
