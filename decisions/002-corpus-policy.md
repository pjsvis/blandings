---
type: ADR
callsign: ADR-CORPUS-POLICY-002
---

# Decision: The corpus policy — publish the silo, hold the copyright

**Date:** 2026-10-10
**Status:** Accepted

## Context

Blandings is public on day 1, and its material is literature: the speech library
is read aloud, so the texts are the silo's subject. Publication turns private
dogfood reading into **redistribution**, and those are different acts in law.

The library's texts do not share a rights status:

- **`the-new-accelerator.md`** — H. G. Wells, 1901. Wells died 1946: public
  domain in every jurisdiction (life+70, and the US term expired long ago).
  Committable anywhere.
- **`company-for-gertrude.md`** — P. G. Wodehouse, 1928. **US public domain since
  2024**, but Wodehouse died 1975, so the text is **in copyright in the UK/EU
  until 2045** — the operator's own jurisdiction. Committing it to a public
  repository redistributes it where it is not free, whatever the US term says.
- **Borges (d. 1986), Calvino (d. 1985)** — in copyright, full stop.

The gate is the **Derrida question** — *should this even be in our consideration
set?* — and it comes before the eval: a rights posture chosen after publication
is a defence, not a decision.

## Decision

**Publish the silo; hold the copyright.** The repository is public; it commits
only texts that are public domain **in every jurisdiction it can reach** — in
practice, worldwide PD.

- **PD-worldwide texts are committed** (`the-new-accelerator.md`), and read aloud
  in the open.
- **Texts in copyright anywhere relevant are never committed.** They are kept
  **local**, referenced **by title and source**, and read from local files. This
  covers `company-for-gertrude.md` (UK/EU to 2045), Borges, and Calvino.
- The library therefore has two halves — a **committed** set and a **local,
  referenced** set. The declaration lives in `narratives/README.md`; the local
  files are gitignored.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Commit the Wodehouse on its US-PD status | The repo reaches the UK/EU, where it is in copyright until 2045; *PD somewhere* is not a licence to redistribute everywhere. |
| Make the whole repo private | Loses the point of a public silo; the risk is one text, not the silo. Scope the exclusion, not the silo. |
| Commit nothing literary; reference all titles | Over-corrects. Wells is free everywhere; excluding him taxes the open half for the risky one. |

## Consequences

**What became easier:** the silo is public and citable; the free half is read
aloud in the open.

**What became harder:** the library is split, and the Wodehouse cannot be heard
from the repository — it is fetched locally. The audition and recital artefacts
that quote it inherit the same restriction.

**Constraints this imposes:** no in-copyright text in the repository, its
commits, its docs, or its rendered artefacts. Reference by title; never paste.

## Related

- `narratives/README.md` — the two halves and the reason
- `decisions/003-the-pipe-folds-in.md` — the library's provenance (a fold-in, not
  a seam crossing)
- `docs/2026-09-11-the-repertory-company.md` — the repertory sketch: *private
  dogfood reading of local files*, the regime this supersedes for a public repo
