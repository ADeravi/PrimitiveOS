/**
 * scripts/sync-tokenos.mjs — sync the generated TokenOS web layer into app/tokenos/ (ADR-090).
 *
 * `app/tokenos/tokenos.css` @imports the two GENERATED files below, and `app/globals.css` @imports tokenos.css —
 * so these files ARE ScnTw's token source for the app + Storybook. They were previously hand-copied out of
 * TokenOS `platform-outputs/web/`, which silently drifted: ScnTw shipped the OLD CVD-broken shadcn chart palette
 * long after TokenOS replaced it with Okabe-Ito (TokenOS ADR-172), plus stale hover values.
 *
 *   npm run sync:tokenos            copy TokenOS's current web output into app/tokenos/
 *   npm run sync:tokenos -- --check verify only; exits 1 on drift (use in CI so it can't rot again)
 *
 * TokenOS location: $TOKENOS_ROOT, else ../../Projects/TokenOS relative to this repo.
 * Run TokenOS's `pnpm build:tokens` first — this copies its build output, it does not build it.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENOS = process.env.TOKENOS_ROOT
  ? resolve(process.env.TOKENOS_ROOT)
  : resolve(ROOT, "../../Projects/TokenOS");
const SRC = join(TOKENOS, "platform-outputs/web");
const DEST = join(ROOT, "app/tokenos");

// exactly the files app/tokenos/tokenos.css imports — keep this list in step with it.
const FILES = ["tokens-referential.css", "shadcn-theme.css"];
const check = process.argv.includes("--check");

if (!existsSync(SRC)) {
  console.error(`✗ TokenOS web output not found at ${SRC}`);
  console.error(`  Set TOKENOS_ROOT, or run \`pnpm build:tokens\` in TokenOS first.`);
  process.exit(1);
}

let drift = 0;
for (const f of FILES) {
  const src = join(SRC, f), dest = join(DEST, f);
  if (!existsSync(src)) { console.error(`✗ missing from TokenOS output: ${f}`); process.exit(1); }
  const next = readFileSync(src, "utf8");
  const cur = existsSync(dest) ? readFileSync(dest, "utf8") : null;
  if (cur === next) { console.log(`  ✓ ${f} in sync`); continue; }
  drift++;
  if (check) { console.error(`  ✗ ${f} DRIFTED from TokenOS`); continue; }
  writeFileSync(dest, next);
  console.log(`  ↻ ${f} updated${cur === null ? " (new)" : ""}`);
}

if (check && drift) {
  console.error(`\n✗ sync:tokenos — ${drift} file(s) drifted. Run \`npm run sync:tokenos\` (after TokenOS \`pnpm build:tokens\`).`);
  process.exit(1);
}
console.log(drift ? `\n✅ synced ${drift} file(s) from ${SRC}` : `\n✅ already in sync with ${SRC}`);
