/**
 * scripts/export-tokens.mjs — regenerate tokens.json from the TokenOS-synced CSS.
 *
 *   npm run tokens            regenerate tokens.json
 *   npm run tokens -- --check verify only; exits 1 on drift (CI)
 *
 * WHY THIS EXISTS (see TOKENOS-INTEGRATION-PLAN.md F1, archive/README.md):
 * `tokens.json` is a PUBLISHED api (package.json `exports["./tokens.json"]`). The previous generator read
 * `app/globals.css` + `@radix-ui/colors` — the two places the tokens MOVED OUT OF when ADR-090 made TokenOS the
 * source. It could no longer regenerate anything real, so tokens.json froze and went stale: it shipped the
 * CVD-broken shadcn chart palette long after TokenOS replaced it with Okabe-Ito. This reads the real source:
 * `app/tokenos/tokens-referential.css`, which `npm run sync:tokenos` keeps equal to TokenOS's gated output.
 *
 * CONTRACT-DRIVEN, deliberately. The published KEY SET and each `$type` are taken from the EXISTING tokens.json;
 * only `$value` is recomputed. tokens.json publishes a curated SUBSET (32 semantic roles — the shadcn-era
 * surface) while the CSS exposes 59 (tertiary, containers, inverse-primary, hover/muted variants...). Emitting
 * everything would silently EXPAND a published contract. Expanding it is a decision, not a side effect — so a
 * published token missing from the CSS is a hard error, and CSS roles outside the contract are reported, never
 * added.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_PATH = join(ROOT, "app/tokenos/tokens-referential.css");
const OUT_PATH = join(ROOT, "tokens.json");
const check = process.argv.includes("--check");

// ── parse the two blocks ───────────────────────────────────────────────────────
// `:root` carries everything; `.dark` carries only the semantic/functional overrides (it declares no
// primitives, elevation or motion — those are mode-independent).
const css = readFileSync(CSS_PATH, "utf8");
const blockOf = (sel) => {
  const i = css.indexOf(`${sel} {`);
  if (i === -1) throw new Error(`${sel} block not found in ${CSS_PATH}`);
  const j = css.indexOf("\n}", i);
  if (j === -1) throw new Error(`${sel} block is unterminated in ${CSS_PATH}`);
  return css.slice(i, j);
};
const declsOf = (b) =>
  Object.fromEntries([...b.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]));

const LIGHT = declsOf(blockOf(":root"));
const DARK = declsOf(blockOf(".dark"));

// ── resolve var() chains to concrete values ────────────────────────────────────
// The semantic/functional tier is REFERENTIAL (`--semantic-primary: var(--primitive-neutral-900)`), but the
// published file carries literals. Follow the chain; primitives resolve out of :root even in dark scope.
// Cycle-guarded. Anything still containing var() throws — never publish an unresolved reference.
function resolve(name, scope, seen = new Set()) {
  if (seen.has(name)) throw new Error(`var() cycle at ${name}`);
  seen.add(name);
  const raw = scope[name] ?? LIGHT[name];
  if (raw === undefined) return undefined;
  const pure = raw.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/);
  if (pure) return resolve(pure[1], scope, seen);
  if (raw.includes("var(")) throw new Error(`unresolved composite var() in ${name}: ${raw}`);
  return raw;
}

// ── rebuild, preserving the contract ───────────────────────────────────────────
const prev = JSON.parse(readFileSync(OUT_PATH, "utf8"));
const missing = [];

const fill = (tier, prefix, scope) => {
  const out = {};
  for (const [key, tok] of Object.entries(tier)) {
    const value = resolve(`${prefix}-${key}`, scope, new Set());
    if (value === undefined) { missing.push(`${prefix}-${key}`); continue; }
    out[key] = { $value: value, $type: tok.$type }; // $type is the contract's, not re-derived
  }
  return out;
};

const next = {
  $description:
    "ScnTw Design System tokens — generated from app/tokenos/tokens-referential.css (the TokenOS web layer, " +
    "kept in sync by `npm run sync:tokenos`) via scripts/export-tokens.mjs. Do not edit by hand; run `npm run tokens`.",
  primitive: fill(prev.primitive, "--primitive", LIGHT),
  semantic: { light: fill(prev.semantic.light, "--semantic", LIGHT), dark: fill(prev.semantic.dark, "--semantic", DARK) },
  functional: { light: fill(prev.functional.light, "--functional", LIGHT), dark: fill(prev.functional.dark, "--functional", DARK) },
  elevation: fill(prev.elevation, "--elevation", LIGHT),
  motion: fill(prev.motion, "--motion", LIGHT),
};

if (missing.length) {
  console.error(`✗ ${missing.length} PUBLISHED token(s) are missing from the CSS — refusing to drop them silently:`);
  for (const m of missing) console.error(`    ${m}`);
  console.error(`  Either restore them upstream in TokenOS, or drop them from tokens.json deliberately.`);
  process.exit(1);
}

// Report (never act on) roles the CSS exposes beyond the published contract.
const extra = Object.keys(LIGHT).filter((n) => /^--(semantic|functional|primitive)-/.test(n)).filter((n) => {
  const [, tier, key] = n.match(/^--(semantic|functional|primitive)-(.+)$/);
  const published = tier === "primitive" ? next.primitive : next[tier].light;
  return !(key in published);
});

const serialized = JSON.stringify(next, null, 2) + "\n";
const current = readFileSync(OUT_PATH, "utf8");

if (check) {
  if (serialized !== current) {
    console.error("✗ tokens.json is STALE — regenerate with `npm run tokens` (after `npm run sync:tokenos`).");
    process.exit(1);
  }
  console.log("✓ tokens.json is up to date with app/tokenos/tokens-referential.css");
} else {
  writeFileSync(OUT_PATH, serialized);
  console.log(serialized === current ? "✓ tokens.json already up to date" : "↻ tokens.json regenerated");
}
console.log(
  `  contract: ${Object.keys(next.primitive).length} primitive · ` +
  `${Object.keys(next.semantic.light).length}/${Object.keys(next.semantic.dark).length} semantic light/dark · ` +
  `${Object.keys(next.functional.light).length}/${Object.keys(next.functional.dark).length} functional · ` +
  `${Object.keys(next.elevation).length} elevation · ${Object.keys(next.motion).length} motion`
);
if (extra.length) console.log(`  note: the CSS exposes ${extra.length} role(s) outside the published contract (not added — expanding it is a decision).`);
