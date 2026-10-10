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
