#!/usr/bin/env bash
# orient.sh — one glance at the silo's state. Read-only: no writes, no builds.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

if git rev-parse --git-dir >/dev/null 2>&1; then
  branch="$(git branch --show-current 2>/dev/null || true)"
  [ -n "$branch" ] || branch="(detached)"
  changed="$(git status --porcelain | wc -l | tr -d ' ')"
  last="$(git log --oneline -1 2>/dev/null || echo 'no commits')"
else
  branch="(no git — run the commissioning checklist)"
  changed="-"
  last="-"
fi

echo "silo:    $(basename "$REPO")"
echo "branch:  $branch"
echo "status:  $changed changed file(s)"
echo "last:    $last"
for d in briefs decisions playbooks; do
  # Guard the absent directory: `find` fails on a missing path, and with
  # `pipefail` that aborts the whole orient — a silo missing a tier should
  # report 0, not die. (-not -name index.md: the generated export is not a
  # document.)
  if [ -d "$d" ]; then
    n="$(find "$d" -maxdepth 1 -name '*.md' ! -name 'index.md' 2>/dev/null | wc -l | tr -d ' ')"
  else
    n=0
  fi
  printf "%-11s %s doc(s)\n" "$d:" "$n"
done
