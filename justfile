# Blandings — the operational vocabulary.
# The shared lexicon for agent and operator; recipes are stable-named, one-line
# delegations. Complex logic lives in scripts/.

[group('navigation')]
help:
    @just --list

# What this is
[group('navigation')]
info:
    @echo "Blandings — The speech play — the entertainment product, sibling to okuda's work product."
    @echo ""
    @echo "An Edinburgh Protocol silo. Start at: just help, then just orient."

[group('navigation')]
orient:
    @bash scripts/orient.sh

# ── voice (the play) ─────────────────────────────────────────

# Speak a file
[group('voice')]
speak file:
    @speak-md {{file}}

# The repertoire audit
[group('voice')]
recital:
    @speak-md recite

# The avionics bed
[group('voice')]
drill:
    @speak-md drill

# The audition book
[group('voice')]
auditions:
    @speak-md auditions.md

# House terms
[group('voice')]
house:
    @mkdir -p tmp
    @speak-md --dry house-terms.md > tmp/house-flat.txt
    @say -v Moira -r 140 -f tmp/house-flat.txt

# The march map
[group('voice')]
census:
    @mkdir -p tmp
    @speak-md census > tmp/census.md

# Literature stress test
[group('voice')]
story:
    #!/bin/bash
    set -euo pipefail
    f="$(gum file narratives --file)"
    [ -n "$f" ] && speak-md --style narrative "$f"

# Pick, then hear
[group('voice')]
pick:
    #!/bin/bash
    set -euo pipefail
    f="$(gum file . --file)"
    [ -n "$f" ] && speak-md "$f"

# Ent probe
[group('voice')]
moira-ent:
    @mkdir -p tmp
    @speak-md --dry tmp/ent-probe.md > tmp/ent-flat.txt
    @say -v Moira -r 140 -f tmp/ent-flat.txt

# March ride
[group('voice')]
moira-ride:
    @mkdir -p tmp
    @speak-md ride --dry > tmp/ride.txt
    @say -v Moira -r 140 -f tmp/ride.txt

# Register bisection
[group('voice')]
moira-register:
    #!/bin/bash
    set -euo pipefail
    say -v Moira -r 140 "Register A. Plain Moira."
    speak-md --style narrative tmp/register-passage.md
    say -v Moira -r 140 "Register B. Five below."
    speak-md --style narrative --pitch -5 tmp/register-passage.md
    say -v Moira -r 140 "Register C. Ten below."
    speak-md --style narrative --pitch -10 tmp/register-passage.md
    say -v Moira -r 140 "Register D. Fifteen below."
    speak-md --style narrative --pitch -15 tmp/register-passage.md

# The aunt probe
[group('voice')]
moira-aunt:
    #!/bin/bash
    set -euo pipefail
    mkdir -p tmp
    say -v Moira -r 140 "The aunt probe. Pitch down is casting, not attitude. Silcrow one one. The control. All Moira, no pitch anywhere."
    speak-md --style narrative tmp/aunt-passage.md
    say -v Moira -r 140 "Silcrow one two. The interleave. The reverend's lines at pitch base minus ten. Freddie's first answers carry no restore; his last one carries an explicit restore. Two speakers, or one in a mood. Does the base come back."
    say -v Moira -r 140 -f tmp/aunt-interleave.txt
    say -v Moira -r 140 "Silcrow one tree. The recital. The reverend's turns in sequence, all at minus ten. Does the auntie hold to the end, or slide into the husk."
    say -v Moira -r 140 -f tmp/aunt-recital.txt

# Epilogue audition
[group('voice')]
moira-epilogue:
    #!/bin/bash
    set -euo pipefail
    say -v Moira -r 140 "The epilogue audition. Candidate zero, the incumbent. Document complete. The exit is two zeros."
    say -v Moira -r 140 "Candidate one, at an end. This document is at an end. There are others. The exit is two zeros."
    say -v Moira -r 140 "Candidate two, concluded, the vernacular. This document is concluded. Others exist, and some of them might not be shite.[[slnc 500]] The exit is two zeros."
    say -v Moira -r 140 "Candidate three, finished. This document is finished. Further documents are available. The exit is two zeros."
    say -v Moira -r 140 "Candidate fower, zero zero. This document is at an end. There are others. The exit is zero zero."

# BRF probe
[group('voice')]
moira-brf:
    @mkdir -p tmp
    @speak-md probe --dry tmp/brf-probe.md > tmp/brf-flat.txt
    @say -v Moira -r 140 -f tmp/brf-flat.txt

# Reverend probe
[group('voice')]
moira-rev:
    @mkdir -p tmp
    @speak-md probe --dry tmp/rev-probe.md > tmp/rev-flat.txt
    @say -v Moira -r 140 -f tmp/rev-flat.txt

# He probe
[group('voice')]
moira-he:
    @mkdir -p tmp
    @speak-md probe --dry tmp/he-fix.md > tmp/he-flat.txt
    @say -v Moira -r 140 -f tmp/he-flat.txt

# Latin audition
[group('voice')]
moira-latin:
    @mkdir -p tmp
    @speak-md probe --dry tmp/latin-probe.md > tmp/latin-flat.txt
    @say -v Moira -r 140 -f tmp/latin-flat.txt

# Table auditions, Moira
[group('voice')]
moira-audition file:
    #!/bin/bash
    set -euo pipefail
    mkdir -p tmp
    for v in speak ordinals records shape; do
        speak-md --tables "$v" --dry "{{file}}" > "tmp/audition-$v.txt"
        echo "— audition $v ({{file}})"
        say -v Moira -r 140 -f "tmp/audition-$v.txt"
    done

# Roofscape, Moira
[group('voice')]
moira-roofs:
    @mkdir -p tmp
    @speak-md probe --dry tmp/roofscape-probe.md > tmp/roofs-flat.txt
    @say -v Moira -r 140 -f tmp/roofs-flat.txt

# Roofscape, Moir
[group('voice')]
moir-roofs voice:
    @mkdir -p tmp
    @speak-md probe --dry tmp/roofscape-probe.md > tmp/roofs-moir-flat.txt
    @say -v {{voice}} -r 140 -f tmp/roofs-moir-flat.txt

# Roofscape, long listen
[group('voice')]
moira-roofs-long:
    @mkdir -p tmp
    @speak-md --style narrative --dry tmp/roofscape-long.md > tmp/roofs-long-flat.txt
    @say -v Moira -r 140 -f tmp/roofs-long-flat.txt

# Roofscape, recital
[group('voice')]
moira-roofs-recital:
    @mkdir -p tmp
    @speak-md --style narrative --dry tmp/roofscape-recital.md > tmp/recital-flat.txt
    @say -v Moira -r 140 -f tmp/recital-flat.txt

# Poet, Moira
[group('voice')]
moira-poet:
    @mkdir -p tmp
    @speak-md probe --dry tmp/poet-probe.md > tmp/poet-flat.txt
    @say -v Moira -r 140 -f tmp/poet-flat.txt

# Poet, Moir
[group('voice')]
moir-poet voice:
    @mkdir -p tmp
    @speak-md probe --dry tmp/poet-probe.md > tmp/poet-moir-flat.txt
    @say -v {{voice}} -r 140 -f tmp/poet-moir-flat.txt

# ── registries ───────────────────────────────────────────────

# Quality gate — before every commit
[group('registries')]
check:
    @bun scripts/reg-sync.ts briefs decisions playbooks

# Repair registry drift
[group('registries')]
reg-sync-fix:
    @bun scripts/reg-sync.ts briefs decisions playbooks --fix

# List briefs
[group('registries')]
reg-briefs:
    @bun scripts/reg-list.ts briefs

# List decisions
[group('registries')]
reg-decisions:
    @bun scripts/reg-list.ts decisions

# List playbooks
[group('registries')]
reg-playbooks:
    @bun scripts/reg-list.ts playbooks
