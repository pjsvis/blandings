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
