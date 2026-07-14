/**
 * scripts/canary-drift.mjs — prove the drift gates actually BITE.
 *
 *   node scripts/canary-drift.mjs tokens   # proves `npm run tokens -- --check` fails on drift
 *   node scripts/canary-drift.mjs sync     # proves `npm run sync:tokenos -- --check` fails on drift
 *
 * WHY (see TOKENOS-INTEGRATION-PLAN.md F2):
 * A check that always exits 0 is WORSE than no check — it's silence-as-pass, and it manufactures false
 * confidence. That failure mode is exactly how ScnTw shipped the CVD-broken chart palette: nothing was
 * watching, but it *looked* fine. A green `--check` only means something if the check can go red.
 *
 * So: plant a known-bad value, run the REAL gate as a subprocess, and require it to fail. The tree is always
 * restored (try/finally). If the tamper itself stops applying (patterns drift too), that is also a failure —
 * a canary that silently plants nothing is the very bug it exists to catch.
 *
 * This runs in CI on every push/PR, so the gates re-prove their teeth continuously rather than resting on a
 * one-off manual verification.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const CASES = {
  // Gate 1: tokens.json must match app/tokenos/tokens-referential.css. Tamper the published file.
  tokens: {
    label: "`npm run tokens -- --check`",
    file: join(ROOT, "tokens.json"),
    tamper: (s) => s.replace(/"\$value": "oklch\([^"]*\)"/, '"$value": "oklch(0.123 0.456 7.89)"'),
    argv: [join(ROOT, "scripts/export-tokens.mjs"), "--check"],
  },
  // Gate 2: app/tokenos/*.css must equal TokenOS's output. Tamper a synced file.
  // (shadcn-theme.css, not tokens-referential.css — this gate's business is the sync, and it keeps the two
  // canaries from tampering the same file.)
  sync: {
    label: "`npm run sync:tokenos -- --check`",
    file: join(ROOT, "app/tokenos/shadcn-theme.css"),
    tamper: (s) => `${s}\n/* canary: planted drift */\n`,
    argv: [join(ROOT, "scripts/sync-tokenos.mjs"), "--check"],
  },
  // Gate 3: profile-deltas.json must equal the engine's real per-profile deltas (F3).
  profiles: {
    label: "`npm run tokens:profiles -- --check`",
    file: join(ROOT, "app/tokenos/profile-deltas.json"),
    tamper: (s) => s.replace(/"--radius-sm": "[^"]*"/, '"--radius-sm": "9.99rem"'),
    argv: [join(ROOT, "scripts/gen-profile-deltas.mjs"), "--check"],
  },
};

const target = process.argv[2];
const c = CASES[target];
if (!c) {
  console.error(`usage: node scripts/canary-drift.mjs <${Object.keys(CASES).join("|")}>`);
  process.exit(2);
}

const original = readFileSync(c.file, "utf8");
const tampered = c.tamper(original);
if (tampered === original) {
  console.error(`✗ CANARY BROKEN — could not plant drift in ${c.file}.`);
  console.error(`  The tamper pattern no longer matches, so this canary proves nothing. Fix the canary.`);
  process.exit(1);
}

let status;
try {
  writeFileSync(c.file, tampered);
  status = spawnSync(process.execPath, c.argv, { cwd: ROOT, stdio: "ignore", env: process.env }).status;
} finally {
  writeFileSync(c.file, original); // always restore, even if the gate throws
}

if (status === 0) {
  console.error(`✗ CANARY FAILED — drift was planted and ${c.label} still PASSED.`);
  console.error(`  The gate is not biting: it would go green for the wrong reason. Fix the check before trusting CI.`);
  process.exit(1);
}
console.log(`✓ canary: ${c.label} correctly FAILED on planted drift (exit ${status}) — the gate bites.`);
