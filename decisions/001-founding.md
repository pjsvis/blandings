---
type: ADR
callsign: ADR-FOUNDING
---

# Decision: The silo is founded

**Date:** 2026-10-10
**Status:** Accepted

## Context

Blandings is commissioned: The speech play — the entertainment product, sibling to okuda's work product.

## Decision

This silo exists, is stamped from the Edinburgh Protocol's commissioning
procedure, and starts **thin by design** — the registry contract is imposed; the
policy (lints, hooks, coupled checks) graduates as the corpus can feed it.

## Consequences

**What became easier:** the silo has an identity, a memory, and a gate from its
first commit.

**What became harder:** there is nothing to lean on yet — the first documents
define the silo's shape, and there are no indexes to search.

**Constraints this imposes:** the registry contract holds from now on. Documents
carry `type` and, when earned, a `callsign`; their registry row is added in the
same commit as the document.

## Related

- `AGENTS.md` — the rules of engagement
- `system.md` — the constitution
