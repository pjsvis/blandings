# speak-md

Dogfood TTS: flatten markdown to speech-safe prose and hand it to macOS
`say` (voice: Moira). One silo, one command, learning over time.

```
doc.md ──► flatten + respell ──► say -v Moira ──► audio
              │        ▲
              ▼        │
     espeak-ng --ipa   (oracle: out-of-band, never in the pipe)
```

The old pipeline — `md | espeak-ng | say` — was a category error: `say`
consumes text only, so it read IPA glyphs as words. The fix was deleting a
stage. espeak-ng keeps exactly one job: the pronunciation oracle used when
tuning a respelling (`speak-md check <word>` prints its IPA, both accents).

## Usage

```
speak-md [file]               flatten + speak (stdin if no file)
speak-md --dry [file]         print the flattened text, speak nothing
speak-md -o FILE [file]       write an AIFF instead of playing
speak-md --voice V --rate N   say options (default: Moira)
speak-md --tables skip        elide tables silently
speak-md learn <mangled> <respelling>   add a lexicon entry
speak-md forget <word>                 remove an entry
speak-md check <word>...              espeak-ng IPA oracle
speak-md lexicon                        list learned respellings
just check                   golden flatten test (pinned empty lexicon)
just demo FILE               before/after listening pair, then play both
00                          STOP actuator: kill anything speaking
```

`00` is the pipeline's master stop (double-tap zero, Enter): kills `afplay`,
`say`, and `espeak-ng`. Silent on success — the silence is the feedback.
Works from any shell, any directory, over SSH. It is deliberately a
command, not a key daemon: no Karabiner dependency, no per-machine config.
If a literal no-Enter double-tap is ever wanted, Karabiner double-tap-0
→ `00` is the upgrade path.

From inside any doc's repo (the usual dogfood case):

```
just -f ~/Dev/GitHub/speak-md/justfile demo NOW.md   # relative paths resolve
```

## Knowledge model

Two tiers, by design:

- **Rules** (built-in, amortized): `td-1692ee` → "task one six nine two e e",
  `ADR-028` → "A D R 28", `2026-09-14` → "the fourteenth of September, 2026",
  `briefs/2026-07-14-brief-locus-tag-consumer.md` → "brief locus tag consumer",
  `TTS`/`OKLCH` → letter-spaced, `→` → "to", `·` → ",". Plus the structural
  flatten: headings announced, lazy continuations joined, tables spoken as
  rows, fences/front-matter/URLs elided.
- **Lexicon** (learned by ear): one-off respellings in `lexicon.json`. An
  entry is *earned* — you hear a mangle, you add it. Never speculative.
  `learn` dirties this silo; commit it as `lex: <word>`. The git history of
  `lexicon.json` is the learning curve. `just check` pins an empty lexicon,
  so learned entries never break the golden test.

The convergence argument: manglers are mostly *generated* tokens (rules cover
them forever) and the remainder is a small closed jargon set (Zipfian — a few
dozen entries covers most events). Correction curve goes asymptotic within
weeks of dogfood use.

## Scope

Environment tooling, not okuda. okuda renders (byte stream → screen); this
tool composites (markdown → speech). The three-concerns test settles it:
speech touches neither the byte stream nor the screen.

## Names (the register)

The speech discipline has a theatre vocabulary — Moira performs, we
coach, and every part of the tuning loop has a name:

| Thing | Name | Notes |
|---|---|---|
| the exe | **`speak-md`** | the call name hosts hold — a thing to call (gloam doctrine, mermaid-to-md precedent); function over pet-name |
| the tuning process | **elocution** | the loop: ear hears a mangle → candidate → oracle check → rendered pair → ear accepts → `learn` → commit (`lex:`) |
| tuning candidates | **auditions** | a respelling trying out; rejected = didn't get the part |
| the tuned words | **the repertoire** | `lexicon.json` — versioned; the git history is the learning curve |
| speaking the list | **the recital** | `speak-md recite` — each entry as «raw». Becomes. «tuned». The audit hears both sides. |
| avionics numbers | **the drill** | `speak-md drill` — the test bed for voice-ingress number vocalisations (`avionics.json`, tuned by ear like everything else) |
| the vocabulary walk | **riding the marches** | the bounded-vocabulary survey — named for the [tradition](https://edinburghridingofthemarches.com/). Two instruments: **the march map** (`speak-md census` — counts what Moira hears, ranked, numbered 11–98 minus actuators, ephemeral references never jotted) and **the ride** (`speak-md ride` — Moira auditions the top 83: pause, silcrow in avionics digits, the word, then a real corpus usage — paced by embedded `[[slnc]]` silence so the ear can listen, jot, and sip; no repeated lead-in words, the digits speak for themselves) |
| the house terms | **the house inspection** | Blandings' `just house` — speaks `house-terms.md`, the house's proper nouns with oracle IPA (L§AB, Leith Scriptorium & Bond, silcrow, okudagram, gloam, Herdr). Word and lip perfect |
| the patron wall | **the commendation rehearsal** | `just moira-commendation` (okuda) — full rehearsal of `docs/2026-09-10-user-commendations.md`; a commendation is a performance, spoken word and lip perfect or not at all |
| the vernacular landing | **the landing** | profanity and vernacular get a post-word `[[slnc]]` — the pause IS the emphasis; the flattener's `VERNACULAR` table (seeded: shite 500ms) grows by ear |
| same-spelling, two-sound words | **the homographs** | phrase-level respellings where context decides (`have read` → `have red` — grammar, not guesswork); the flattener's `HOMOGRAPHS` table |
| the house sign-off | **the epilogue** | "Document complete. The exit is two zeros." — every full-document read closes by teaching the 00 actuator |

The avionics map's open adjudication: the morphology doc says "Vector
one **fiver**" for token 15; radiotelephony standard is "**fife**".
The drill speaks both — the ear decides. (Oracle: fife /faɪf/, fiver
/faɪvə/ — the -er risks slurring into adjacent digits; niner keeps its
-er by tradition, and tradition is the only reason.)

## Playbooks

The house documents moved to the **play silo** (`Blandings`) on 2026-10-10 —
the pipe no longer owns them:

- `Blandings`' `playbooks/elocution-playbook.md` — the ear-driven tuning
  procedure (scan → probe → report → audition → fix → recital), with `-ent` as
  the worked example.
- `Blandings`' `house-terms.md`, `auditions.md`, and the `narratives/` library.

This silo owns the **pipe**: the flattener, `lexicon.json` (the repertoire),
`avionics.json` (the drill), `breaths.json`.

## Preferences & config

There is no config file, by doctrine (`docs/2026-08-31-actuator-inputs.md`:
no config or ini — state lives in the corpus or in the process). Three
 tiers:

1. **Code defaults** — voice Moira, rate 140 (dogfood-tuned). Changing a
   default is a commit, reviewed like any other change.
2. **`lexicon.json`** — the learned preferences, beside the exe. Git
   history *is* the preference record.
3. **CLI flags** — `--voice`, `--rate`, `--tables` — per-call, owned by
   the caller, never persisted here.

For a host (gloam, herdr, any launcher): the contract is a call line,
`speak-md FILE` — everything speech-related resolves inside the exe.
Hosts may pass flags; they hold no speech knowledge.

## Install

`~/bin/speak-md -> ~/Dev/GitHub/speak-md/speak-md` (ctx-cli pattern).

Dependencies: macOS `say`, espeak-ng (oracle only, `brew install espeak-ng`),
Python 3 stdlib only.
