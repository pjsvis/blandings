# DEPENDENCIES — Blandings

External tools this silo depends on. Brief preconditions verify against this
file — an entry with a verified date is a claim we have checked, not an
assumption.

| Tool | Version | Purpose | Verified |
|------|---------|---------|----------|
| `bun` | | runtime for the registry tooling | |
| `just` | | task runner (the operational vocabulary) | |
| `git` | | version control | |
| `td` | | task management | |
| `speak-md` | | the actuator — flatten markdown to speech-safe prose (`~/Dev/GitHub/speak-md`) | |
| `gum` | | the file picker for `just story` / `just pick` | |
| `say` | system (macOS) | the voice — the play's output | |

Fill the versions and dates as they are verified; a missing dependency halts a
brief rather than being worked around silently.
