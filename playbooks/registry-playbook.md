---
type: Playbook
callsign: PLY-REGISTRY
date: 2026-10-11
status: canonical
---

# Registry playbook — the index and its edges

The registry machinery is `scripts/reg-sync.ts`; this playbook is the part that
does not read off the code — the rule it serves, and the edges it has. For the
schema, the status vocabulary, the tier list and the recipes, read the code and
`just --list`. A prose copy of those drifts; the code does not.

## No parallel stores

The JSONL index is the single source of truth for a directory's contents. Do not
maintain a second tracker — a spreadsheet, a Notion doc, an agent's private
memory file, a chat. If the index is stale, fix the index.

Read at full strength, this is the silo's knowledge rule too: **if it is not in
the silo, it does not exist.** A principle that lives only outside the tree
cannot be searched, cited from a brief or read aloud — so it is not a record.
The test that separates a cache from a shadow store: **can it be deleted and
regenerated from the silo?** If yes it is a cache and may be lossy; if no it is a
shadow store, and the knowledge belongs in a document.

Across a boundary the rule has a harder form: silos communicate by message,
never by shared file. That is the **seam rule** (`system.md`).

## Ordering

`renderIndexDoc` sorts newest-first, so the generated `index.md` views are
newest-first and the JSONL store is append-order. Do not align them: the store
has no reading order, the view does. Nothing here mints addresses into the views.

## Traps — measured against `scripts/reg-sync.ts`, 2026-10-11

- **`summary` is derived once, never re-derived.** It comes from the H1, and
  `derivedDrift` never compares it. Retitle a document and the stored summary
  goes stale while `just check` still reports OK. Fix it by hand in the JSONL,
  then `just reg-sync-fix` to regenerate the view.
- **`--fix` drops an unparseable line.** `readIndex` warns and skips it, then the
  rewrite omits it — a malformed row loses its data with only a warning. Repair
  conflict markers by hand before running `just reg-sync-fix`.
- **An unknown `**Status:**` word is silent on the add path.** `statusWord` takes
  the first word and `deriveStatus` falls back to the tier default, so a *new*
  document whose status is outside the vocabulary is stored as `open`. An
  existing row is reported `UNKNOWN STATUS` instead.
- **The key is `file`, not `path`** — filename only, relative to the registry
  directory.
