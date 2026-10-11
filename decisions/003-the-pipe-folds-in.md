---
type: ADR
callsign: ADR-PIPE-FOLDS-003
---

# Decision: The pipe folds in — speak-md is not a sibling silo

**Date:** 2026-10-11
**Status:** Accepted

## Context

`speak-md` was built as a silo of its own: the flattener (markdown → speech-safe
prose), with its own `AGENTS.md`, `justfile`, tests, and constitution. It was
**abandoned before occupation** — no session ever ran in it, so nothing in it is
a silo's record; it is a tool and its tuning.

Blandings is the speech play, and the pipe is how the play is spoken. The pipe
has no consumer but this silo, and a boundary inside a silo is a gate that spans
nothing.

## Decision

**Fold the pipe in.** `speak-md/` lives in this silo as an in-tree module: the
flattener, its tests, its justfile and its tuning state (`lexicon.json`,
`avionics.json`, `breaths.json`), reached on PATH via `~/bin/speak-md` →
`speak-md/speak-md`. It is a **dependency of the play**, not a sibling.

The language of *import across the seam* is **retired for this material**.
speak-md was never occupied, so there was no sender to own an original and no
seam to cross. The provenance is a **fold-in**, and this silo owns the whole of
it. Sibling silos remain exactly one thing — message-passing peers — and okuda
is the live example.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep speak-md a separate silo | No independent consumer, no session, and no boundary that buys anything; the seam rule protects boundaries, it does not multiply them. |
| Vendor it as an opaque dependency | Its tuning *is* the play's tuning — the lexicon is learned by ear against performances. Not a black box. |
| Duplicate the flattener here | A second copy of a component the silo already owns is a parallel store. |

## Consequences

**Easier:** one boundary; one `just check` that can gate the pipe's golden test
alongside the registries; the tuning state is citable from briefs.

**Harder:** the pipe's history travels with this silo's, and its stale
self-description (`speak-md/AGENTS.md`, "silo rules") is now this silo's to
correct — as are the absolute paths it still carried to its pre-fold-in home.

## Related

- `README.md` — the pipe, and "Related silos — named, never linked"
- `playbooks/elocution-playbook.md`, `house-terms.md`, `auditions.md` — folded-in documents
- `narratives/README.md` — the library's provenance
