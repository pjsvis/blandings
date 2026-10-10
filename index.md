---
okf_version: "0.2"
name: blandings
type: Bundle
---

# Blandings — knowledge silo

An OKF v0.2 bundle: a directory tree of markdown documents with parseable
frontmatter. The JSONL registries are the private fast index; each tier exports
a generated `index.md` — never hand-edited.

| Tier | Registry | Export |
|---|---|---|
| briefs | `INDEX.jsonl` | `briefs/index.md` |
| decisions | `INDEX.jsonl` | `decisions/index.md` |
| playbooks | `REGISTRY.jsonl` | `playbooks/index.md` |

Documents carry `type` and, when earned, a durable `callsign` in frontmatter —
the human code for low-bandwidth channels.
