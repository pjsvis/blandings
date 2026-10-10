# Blandings — Project Identity

The speech play — the entertainment product, sibling to okuda's work product.

A silo in the Edinburgh Protocol family. Constitution: `system.md`.
Stamped 2026-10-10.

## Rules of Engagement

1. **Orient first.** `just orient` at session start; `td usage --new-session`
   for task identity.
2. **Brief before build.** Non-trivial work gets a brief in `briefs/` before it
   is built.
3. **Registry principle.** A directory that accumulates documents gets a
   registry; add the document and its index row in the **same commit**.
4. **Branch hygiene.** Never commit work directly to `main`.
5. **Quality gate.** `just check` before every commit — it must pass.
6. **Decisions get ADRs.** Two viable options, a reversal, or a new pattern →
   a decision in `decisions/`.

## Scope Discipline

**In:** The speech play — the entertainment product, sibling to okuda's work product.

**Out:** _name what this silo does not do, so scope creep can be refused at the
door rather than argued after the fact._

## Knowledge System

Briefs (`briefs/`), decisions (`decisions/`), playbooks (`playbooks/`). The
registries are the fast index; each tier's `index.md` is generated — never
hand-edited.
