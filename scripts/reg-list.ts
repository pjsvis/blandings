#!/usr/bin/env bun
/**
 * reg-list.ts — human-readable listing of a registry index.
 *
 * Usage:
 *   bun scripts/reg-list.ts <registry>   # briefs|debriefs|decisions|playbooks
 *   bun scripts/reg-list.ts --all
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const REGISTRIES: Record<string, { dir: string; index: string }> = {
  briefs: { dir: "briefs", index: "INDEX.jsonl" },
  debriefs: { dir: "debriefs", index: "INDEX.jsonl" },
  decisions: { dir: "decisions", index: "INDEX.jsonl" },
  playbooks: { dir: "playbooks", index: "REGISTRY.jsonl" },
};

interface Entry {
  file: string;
  date: string;
  status: string;
  summary: string;
  callsign?: string;
  meta?: Record<string, unknown>;
}

function load(name: string): Entry[] {
  const def = REGISTRIES[name];
  if (!def) {
    console.error(`Unknown registry: ${name} (valid: ${Object.keys(REGISTRIES).join(", ")})`);
    process.exit(2);
  }
  let raw: string;
  try {
    raw = readFileSync(join(ROOT, def.dir, def.index), "utf8");
  } catch {
    return [];
  }
  return raw
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as Entry);
}

const args = process.argv.slice(2);
const names = args.includes("--all") || args.length === 0
  ? Object.keys(REGISTRIES)
  : args.filter((a) => !a.startsWith("--"));

let total = 0;
for (const name of names) {
  const entries = load(name).sort((a, b) => b.date.localeCompare(a.date));
  total += entries.length;
  console.log(`\n${name} (${entries.length})`);
  if (entries.length === 0) {
    console.log("  — empty —");
    continue;
  }
  const wFile = Math.max(...entries.map((e) => e.file.length), 4);
  const wStatus = Math.max(...entries.map((e) => e.status.length), 6);
  const wCs = Math.max(...entries.map((e) => e.callsign?.length ?? 0), 3);
  for (const e of entries) {
    const src = e.meta?.source ? ` [${e.meta.source}]` : "";
    const cs = (e.callsign ?? "").padEnd(wCs);
    console.log(`  ${e.date}  ${e.status.padEnd(wStatus)}  ${e.file.padEnd(wFile)}  ${cs} ${e.summary}${src}`);
  }
}
console.log(`\n${total} document(s) across ${names.length} registr${names.length === 1 ? "y" : "ies"}`);
