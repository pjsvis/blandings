---
type: Playbook
callsign: PLY-ELOCUTION
date: 2026-09-11
status: active
---

*Imported from speak-md 2026-10-10 — a declared copy across the seam. The source owns the original; this silo owns this copy.*

# The elocution playbook — tuning Moira by ear

Here's what to do, word by word or class by class. The process is named
**elocution**; the vocabulary lives in the README register (auditions,
repertoire, recital, drill, probe). This is the procedure.

## The loop, at a glance

```
ear → probe → report → audition → oracle → fix → recital → commit
```

## Phase 0 — riding the marches (the survey)

Named for the tradition — [Riding the
Marches](https://edinburghridingofthemarches.com/) — boundary-riders
checking the edge. Two instruments:

- **The march map** — `just census` (→ `tmp/census.md`): what Moira
  actually hears, ranked, numbered 11–98 minus actuators. Numbers are
  *ephemeral references* — cite them in speech or notes, never jot
  them into durable docs (ADR-021 doctrine); regenerate as the corpus
  moves. Frequency is rent: the Zipf head says which classes earn
  probes, the tail says which words earn lexicon entries.
- **The ride** — `just moira-ride`: Moira auditions the top 83. Paced
  by embedded `[[slnc]]` silence (say's native embedded commands —
  verified): a pause, then the silcrow in avionics digits, a beat, the
  word, then a real corpus usage, then a coffee-sized gap — the ear
  listens, jots a number, sips. No repeated lead-in words: the digits
  speak for themselves, and repetition jars.

The survey feeds phase 1: a mangle heard on the ride names either a
word (→ lexicon) or a class (→ probe) by token number.

## Phase 0b — is it worth it? (the class scan)

Frequency is rent. A class earning no airtime earns no probe.
```
rg -oi --no-filename '[a-z]+ent\b' --glob '*.md' <doc dirs> \
  | tr 'A-Z' 'a-z' | sort | uniq -c | sort -rn | head -12
```

Read the head. If it's Zipf-shaped (a few giants), proceed. If flat and
rare, close the file — negative triage is still triage.

## Phase 1 — author the probe

The probe doc is a bullet list — each entry a word and its carrier
sentence. **Without controls the ear confirms bias instead of testing
a boundary** — treatment words *and* expected-safe controls.

```markdown
# The <class> probe

Intro line. The flat output is the map — mark by number.

- **document** — The document is registered, never a brief.
- **spent** — The evening was well spent.   (a control)
```

- Doc: `tmp/<class>-probe.md` (scratch tier — regenerable)
- Speak: `speak-md probe` — silcrow-numbered (local 11.., actuators
  skipped), paced (`[[slnc]]` 600/700/900), the flat output is the
  number map. Numbers are probe-local and ephemeral — never jot them;
  the "silcrow" lead-in marks which map you're hearing (probe, not
  census).
- Recipe: `just moira-<class>` in this silo's justfile, `[group('voice')]`,
  following `moira-ent`:

```
[group('voice')]
moira-<class>:
    @mkdir -p tmp
    @speak-md probe --dry tmp/<class>-probe.md > tmp/<class>-flat.txt
    @say -v Moira -r 140 -f tmp/<class>-flat.txt
```

## Phase 2 — round one: listen, then report

Play the probe; read along (`tmp/<class>-probe.md`) if you want
the input visible while the output sounds. Round one is the baseline —
the flattener passes an unprobed class through untouched, so what you
hear is Moira's raw behaviour.

The report names: **which** words mangled, and **how** they sounded.
Then the decision tree:

| Report | Fix shape |
|---|---|
| treatment words only | class-wide: a flattener rule (phase 3b) |
| controls mangled too | the boundary hypothesis was wrong — re-cut the probe, don't re-fix |
| a few scattered offenders | per-word: lexicon entries (phase 3a) |
| nothing mangled | record "clear" in the td log and stop — negative results are data |

## Phase 3 — the fix

**3a. Per-word (the lexicon path).** Audition a respelling — candidate
spellings tried until one lands. The oracle (`speak-md check <word>`)
verifies how a candidate *reads*; it cannot predict Moira (different
vocal tract — see the oracle box). Render the before/after pair, hear
it, then:

```
speak-md learn <mangled> "<respelling>"    # commit as: lex: <word>
```

**3b. Class-wide (the rule path).** When the class mangles uniformly,
add one rule to the flattener (between the generated-token rules and
the lexicon in precedence). The probe becomes its regression test —
update the golden in the same change. Never a blanket rewrite that
walks through the controls.

## Phase 4 — register

`speak-md recite` speaks the repertoire (mangle-then-tuned per entry —
the audit). `td log` records where the dogfood stands. A new instrument
gets a README row.

## The invariants, enunciated

System invariants (dates, ids, callsigns, paths) are *generated tokens*
— the rule tier, never the lexicon: productive patterns, one probe each,
not one-off entries. Current contract:

| Invariant | Example | Current sound | Status |
|---|---|---|---|
| ISO date | 2026-09-14 | "the fourteenth of September, 2026" | tuned |
| td id | td-1692ee | "task one six nine two e e" | tuned |
| ADR | ADR-028 | "A D R 28" | tuned |
| Path | briefs/2026-07-14-brief-locus-tag-consumer.md | "brief locus tag consumer" | tuned |
| Token | 11–98 | avionics digits (drill) | tuned |
| Callsign | BRF-ONION-SEARCH-GRAMMAR | raw compound | **untuned** — candidate: prefix map (BRF→brief, PLY→playbook) |
| Short hash | 9e4a8f0 | raw | **untuned** — candidate: spell like td ids |
| Time | 14:24 | raw | **untuned** — candidate: "fourteen twenty-four" |
| Branch | feat/speech-recipes | raw slash | **untuned** — candidate: basename words |
| Env var | OKUDA_BRIGHTNESS | letter-spaced + raw underscore | **untuned** |

Each untuned row earns its sound through the same loop — probe, ear,
rule — never by assertion. The table registers candidates so they
aren't re-litigated each session.

## The house inspection

In-house terms (L§AB, Leith Scriptorium & Bond, silcrow, okudagram,
Herdr, gloam) are brand surfaces: `house-terms.md` in this silo is the
list, `just moira-house` speaks it, and each term earns its sound
through the same loop before Moira says it in public. The
**commendation standard** governs the patron wall: a commendation is
a performance — full rehearsal (`just moira-commendation`), every
proper noun auditioned (Plinius, Vesuvius, Titus), word and lip
perfect or not at all.

## The homographs, the landing, the epilogue

Three flattener-level rules with tables in the exe (defaults tier — a
value change is a commit):

- **Homographs** (`HOMOGRAPHS`): same spelling, two sounds — the lexicon
  cannot hold them; phrases can. `have/had read` → `red` is grammar,
  not guesswork. Found by ear ("read sounded like red" — it was the
  wrong red).
- **The vernacular landing** (`VERNACULAR`): profanity and the
  vernacular get a post-word `[[slnc]]` — the pause lets the word
  land. Seeded with `shite` (500ms); the generalisation is the ear's
  project.
- **The epilogue** (`EPILOGUE`): every full-document read closes with
  "Document complete. The exit is two zeros." — the sign-off teaches
  the 00 actuator. Performances (recital, drill, ride) own their own
  endings and bypass it.

## The oracle, honestly

espeak-ng checks that a candidate respelling spells the sound you
intended. It cannot tell you what Moira will do — different tract,
different defaults. The ear adjudicates the target; the oracle only
verifies the candidate. For Moira-specific behaviour (her `-ent`,
her rate), the ear is the only instrument. That's why this playbook
is a loop and not a lookup.

## Worked example: -ent (in flight)

- **Scan:** document 875×, content 499, agent 215, intent 175 — Zipf
  head, probe earned.
- **Probe:** `tmp/ent-probe.md`, recipe `just moira-ent`.
- **Round one:** played. The flattener passes -ent through untouched;
  the heard mangle is baseline.
- **Round two:** awaits the ear report — which words, how.
- **Review:** `just moira-ent` (replay the probe), `speak-md recite`
  (current repertoire — no -ent entries yet), td log (process state).

## Next application: -ing (phase 0 done)

Scan head: nothing 200×, thing 181, reading 162, rendering 157,
heading 123, string 121, existing 95, working 57.

The cut, pre-declared (before hearing — so it's a prediction):
- **Controls:** thing, string, nothing, something — stressed or
  lexicalized -ing, the sound is expected safe.
- **Treatment:** rendering, reading, working, existing — productive
  gerund, unstressed suffix, expected mangle candidate.

Prediction on record: controls hold, treatment mangles. Author the
probe (`tmp/ing-probe.md`), add `just moira-ing`, run round one. The
report decides.

## Where the state lives

| State | Home |
|---|---|
| repertoire (tuned words) | `speak-md/lexicon.json` (git = learning curve) |
| probes, probes' audio | `tmp/`, scratch tier, regenerable |
| recipes (the instruments) | this silo's justfile, `[group('voice')]` |
| avionics table | `speak-md/avionics.json` |
| process state | td (td-1977bc) |
| vocabulary, register | `speak-md/README.md` |
