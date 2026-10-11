---
type: Brief
callsign: BRF-VERIFIABILITY
---

# Brief: Wire up verifiability — the gates the corpus does not yet have

**Date:** 2026-10-11
**Status:** Open (proposal — not started)

## Context

`just check` (`justfile:214-215`) runs one thing: registry drift across three
tiers. The silo's prose — `system.md`, `conceptual-lexicon.md`,
`house-terms.md`, `auditions.md`, `index.md`, `README.md`, `docs/` — is gated by
nothing at all. The one behavioural test that exists, speak-md's golden test
(`pipe-check`, `justfile:207-208`), is a *sibling* recipe, not part of the gate.

Measured on the corpus today, before proposing anything:

- The entire silo contains **exactly one** `path:line` citation. It is
  `system.md:157` → `playbooks/registry-playbook.md:116-127`, and **the referent
  does not exist here** (`playbooks/` holds `elocution-playbook.md`, `index.md`,
  `REGISTRY.jsonl`). The audit surface fails on its first dereference.
- `conceptual-lexicon.md:6-8` states the rule — *every entry cites the document
  that defines it* — and `:12` records *"No entries yet"*. The rule has no
  subject and no gate.
- `docs/2026-09-11-the-repertory-company.md` exists and is scanned by nothing.
- `scripts/reg-sync.ts:42-54` defines six registries; this silo reaches three.

## What

Bring the silo's claims under gates, in this order (value per unit of cost):

1. **The gate admits the behavioural test.** `check` runs `pipe-check`. The
   silo's only executable test currently cannot fail a commit.
2. **Citation lint** — every `path:line` in scanned documents resolves: the path
   exists, the line is within the file. First run fails on `system.md:157`;
   that failure *is* the proof the gate works.
3. **Lexicon lint** — every `conceptual-lexicon.md` entry cites its defining
   document (the rule already written at `:6-8`), baseline for pre-existing
   sediment, baseline may only shrink.
4. **Scan-set completeness** — `docs/` and the five root documents enter the
   scan set, or `docs/` gains a registry. Evidence: a broken citation in a root
   document is invisible today.
5. **Date invariant** — a document's ISO filename prefix and its declared
   `**Date:**` must agree. The corpus is date-prefixed and nothing checks it.
6. **The one-way valve** — persisted documents cite callsigns and SHAs, never td
   IDs (okuda's `scripts/td-id-lint.ts`). Zero instances today, so the baseline
   starts empty and the gate costs nothing to hold.

## Why it earns its place

Each gate names the observation that would falsify it, so none of them is a
slogan:

| Gate | Falsified by |
|---|---|
| 1 | a deliberately broken `speak-md` fixture exits 0 from `just check` |
| 2 | a two-line patch adding `scripts/nope.ts:12` — lint must fail |
| 3 | a lexicon entry with no defining document — lint must fail |
| 4 | a broken citation inside `docs/` — lint 2 must catch it |
| 5 | `cp` a decision to a mismatched date prefix — lint must fail |
| 6 | `td-abc123` pasted into any decision — lint must fail |

The gates also make the *silence* visible, which is the point the protocol keeps
returning to: this silo could not tell that its one citation was dead, because
nothing was pointed at it. An ungated claim is not a verified claim.

## How

- Port the shape, not the corpus. okuda's gate is
  `okuda/justfile:117-118` — eleven lints chained. Its base scanner,
  `okuda/scripts/td-id-lint.ts`, exports `scannedFiles()` and `EXEMPT_FILES` so
  one scan set feeds several gates and cannot drift between them. Take that
  factoring: one scanner module, N lints over it.
- Baselines follow the house ratchet exactly as okuda documents it
  (`lexicon-baseline.json`, `date-baseline.json`): adopted sediment is recorded,
  *at-count passes, over-count fails*, and the baseline may only shrink. Never
  bulk-edit history to make a new gate green.
- Bun scripts under `scripts/`, one recipe per gate, all called from `check`.
- **Design note, measured.** A naive citation regex run over *this brief* returns
  two findings: `scripts/nope.ts:12` (a deliberate counter-example in the
  falsification table) and the dead `playbooks/registry-playbook.md:116` (the
  defect under report). Gate 2 therefore needs an escape for quoted
  counter-examples — a marker comment or an exempt-block rule — or the lint
  cannot be written *about*, only written. Adopt the escape with the gate, not
  after it, since the first failing run is the proof.
- ADR first if the scan-set/tier question (item 4) changes the registry model —
  that is a decision, not a lint.

## Scope

Six gates, one scanner module, `just check` rewired, plus the one-line fix to
`system.md:157`. Design work is this brief; implementation is a separate pass.

## Out of scope

- **okuda-specific lints** — `facade-lint`, `tree-lint`, `signature-check`,
  `archive-lint`, `prose-check --strict-leaks` are answers to okuda's
  problems. The retrofit playbook is explicit: a reference implementation is
  not a template (`cool-pi-extensions/playbooks/repo-setup-retrofit-playbook.md`).
- **The Pi agent config audit** — built in `cool-pi-extensions`
  (`scripts/audit-pi-config.ts`, `just pi-audit`); that silo owns it by Decision
  013 and the request is in its inbox.
- **speak-md's internal tests** — they live in `speak-md/justfile check`; item 1
  wires the gate, it does not write new tests.
- **New documents.** This brief does not add corpus, only gates over what is
  already claimed.

## Open question for the operator

Which of the six are worth holding? Item 1 is free and item 2 pays for itself
immediately (it has a live defect to catch). Items 5 and 6 are cheap now and
cheapest now. Items 3 and 4 are the two that want an ADR, because each decides
where documents live rather than how they are checked.
