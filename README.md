# Blandings

The speech play — the entertainment product, sibling to okuda's work product.

A **silo** — a self-contained project directory with named compartments and a
registry-backed memory. `just orient` orients; `just check` is the gate; the
constitution is `system.md`.

## Layout

| Path | What it is |
|---|---|
| `briefs/` | records of intent — the spine |
| `decisions/` | ADRs — why we chose X over Y |
| `playbooks/` | how we do X |
| `docs/` | the record — the cast, the imported procedures |
| `narratives/` | the library — texts read aloud |
| `speak-md/` | **the pipe** — the flattener (markdown → speech-safe prose) |
| `house-terms.md`, `auditions.md` | the house documents — proper nouns, the audition book |
| `conceptual-lexicon.md` | the silo's own terms of art |
| `system.md` | the Edinburgh Protocol — the constitution |
| `justfile` | the operational vocabulary |

External tools: `DEPENDENCIES.md`.

## The pipe

`speak-md/` is the flattener — the process a recital calls for, and the
process the play rehearses against. It is self-contained: its own `justfile`,
`tests/`, and the tuning state (`lexicon.json` the repertoire, `avionics.json`
the drill, `breaths.json`). This silo owns it. The command is on PATH:
`~/bin/speak-md` → `speak-md/speak-md`.

## Related silos

Named, never linked:

- **okuda** — the renderer: markdown in, coloured bytes out.
- **The pipe** (`speak-md`) — here, not a silo of its own.

*Stamped 2026-10-10 from the Edinburgh Protocol's commissioning procedure.*
