#!/usr/bin/env node
// loop.mjs — the closed loop: render → critique → adjust → re-render.
//
// Each round screenshots a Storybook story, grades the pixels (critique.mjs),
// and — where the fix is expressible as a Storybook arg override — nudges and
// re-renders. Fixes that need pipeline/code changes are logged as
// recommendations (the loop reports them rather than silently failing).
//
// Usage:
//   node tools/diagram-critique/loop.mjs --story diagram-overview--flowchart --rounds 3
//
// Storybook arg overrides ride the URL (?args=key:value;…), so the loop tunes
// the real component with no code edits.

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };

const STORY = arg("story", "diagram-overview--flowchart");
const BASE = arg("base", "https://aderavi.github.io/ScnTw-Design-system");
const MODEL = arg("model", "claude-sonnet-4-6");
const ROUNDS = Number(arg("rounds", "3"));

// criterion action → Storybook arg nudge (only the few that args can fix).
const ARG_FIX = {
  separateOverlaps: (a) => ({ ...a, height: (a.height || 480) + 120 }),
  thinLabelsOrEnlarge: (a) => ({ ...a, height: (a.height || 480) + 80 }),
  refit: (a) => ({ ...a, height: (a.height || 480) + 60 }),
};

const serialize = (a) => Object.entries(a).map(([k, v]) => `${k}:${v}`).join(";");

let args = {};
const trajectory = [];

for (let round = 1; round <= ROUNDS; round++) {
  const r = spawnSync("node", [
    join(HERE, "critique.mjs"), "--story", STORY, "--base", BASE, "--model", MODEL,
    ...(Object.keys(args).length ? ["--args", serialize(args)] : []),
  ], { stdio: "inherit", env: process.env });
  if (r.status !== 0) { console.error("round failed"); break; }

  let report;
  try { report = JSON.parse(await readFile(join(HERE, "out", `${STORY}.json`), "utf8")); }
  catch { console.log("no machine-readable critique (no API key?) — stopping after screenshot."); break; }

  const grade = report.overall?.grade, pass = report.overall?.pass;
  trajectory.push({ round, args: { ...args }, grade, score: report.overall?.score });
  console.log(`\n── round ${round}: ${grade} ${pass ? "PASS" : ""} args=${serialize(args) || "(default)"}\n`);
  if (pass) break;

  // apply the worst-scoring criterion's fix.
  const worst = (report.criteria || []).slice().sort((x, y) => (x.score ?? 1) - (y.score ?? 1))[0];
  const fix = worst && ARG_FIX[worst.action];
  if (fix) { args = fix(args); }
  else {
    console.log(`↳ top fix needs a code/pipeline change, not an arg: ${worst?.action} — ${worst?.finding}`);
    break;
  }
}

console.log("\n=== trajectory ===");
trajectory.forEach((t) => console.log(`r${t.round}: ${t.grade} (${t.score}) ${serialize(t.args) || "default"}`));
