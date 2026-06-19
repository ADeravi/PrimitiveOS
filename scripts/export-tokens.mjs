#!/usr/bin/env node
/**
 * Export the 3-tier token system from app/globals.css to tokens.json
 * (W3C Design Tokens-flavoured, grouped by tier and mode) so design tools
 * (Figma Tokens / Tokens Studio) and other platforms can consume it.
 *
 * Resolves var(--radix-scale-step) references against the Radix Color CSS
 * files in node_modules, so tokens.json contains concrete colour values
 * rather than unresolved var() strings.
 *
 *   npm run tokens
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

/** Extract `--name: value;` declarations from the body of a selector block. */
function declarations(selector) {
  const re = new RegExp(`(?:^|\\n)\\s*${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, "g");
  const out = {};
  let m;
  while ((m = re.exec(css))) {
    for (const d of m[1].matchAll(/--([\\w-]+)\\s*:\\s*([^;]+);/g)) {
      out[d[1]] = d[2].trim();
    }
  }
  return out;
}

/**
 * Build a flat map of { varName: concreteValue } from every *light* Radix
 * Color CSS file in node_modules/@radix-ui/colors.
 * These are the Tier-1 primitive values our semantic tokens reference.
 */
function buildRadixMap() {
  const radixDir = join(root, "node_modules/@radix-ui/colors");
  const map = {};
  if (!existsSync(radixDir)) {
    console.warn("⚠  node_modules/@radix-ui/colors not found — var() values will not be resolved.");
    return map;
  }
  for (const file of readdirSync(radixDir)) {
    // Skip dark files (they override inside .dark; we export light values here)
    if (!file.endsWith(".css") || file.includes("dark")) continue;
    const src = readFileSync(join(radixDir, file), "utf8");
    for (const m of src.matchAll(/--([\\w-]+)\\s*:\\s*([^;]+);/g)) {
      map[m[1]] = m[2].trim();
    }
  }
  return map;
}

const rootVars = declarations(":root");
const darkVars  = declarations("\\.dark");
const radixMap  = buildRadixMap();

/**
 * Resolve a CSS value that may be var(--something), up to 4 levels deep.
 * Lookup order: globals.css :root vars → Radix Color primitives.
 */
function resolveVar(value, depth = 0) {
  if (depth > 4) return value;
  const m = value.match(/^var\\(--(\\S+?)(?:\\s*,.*?)?\\)$/);
  if (!m) return value;
  const name = m[1];
  const next = rootVars[name] ?? radixMap[name];
  return next ? resolveVar(next, depth + 1) : value;
}

const typeOf = (key, value) => {
  if (key.startsWith("duration-")) return "duration";
  if (key.startsWith("ease-"))     return "cubicBezier";
  if (key.startsWith("shadow-"))   return "shadow";
  if (key === "radius" || /^(spacing|text)-/.test(key)) return "dimension";
  if (/oklch|color\\(|rgb|#[0-9a-f]{3,8}/i.test(value)) return "color";
  return "other";
};

const token = (key, rawValue) => {
  const resolved = resolveVar(rawValue);
  return { $value: resolved, $type: typeOf(key, resolved) };
};

const group = (entries) =>
  Object.fromEntries(entries.map(([k, v]) => [k, token(k, v)]));

// ── Token categories ──────────────────────────────────────────────────────────
// Collect Radix primitive names actually referenced by semantic tokens, so
// Figma Tokens / Tokens Studio can resolve alias chains offline.
const SEMANTIC_REFS = new Set(
  [...Object.values(rootVars), ...Object.values(darkVars)].flatMap((v) => {
    const matches = v.match(/var\\(--(\\S+?)(?:\\s*,.*?)?\\)/g);
    return matches
      ? matches.map((s) => s.replace(/^var\\(--/, "").replace(/[\\s,)].*/,""))
      : [];
  })
);

const primitiveTier = Object.fromEntries(
  [...SEMANTIC_REFS]
    .filter((k) => k in radixMap)
    .sort()
    .map((k) => [k, token(k, radixMap[k])])
);

const FUNCTIONAL     = ["success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground", "rose"];
const MOTION_PREFIXES = ["duration-", "ease-"];
const SHADOW_PREFIX   = "shadow-";

const isMotion    = (k) => MOTION_PREFIXES.some((p) => k.startsWith(p));
const isPrimitive = (k) => k in primitiveTier;

const tokens = {
  $description:
    "ScnTw Design System tokens — generated from app/globals.css by scripts/export-tokens.mjs. " +
    "Do not edit by hand. Tier-1 primitives are Radix Color steps referenced by semantic tokens; " +
    "all values are resolved to concrete colours at export time.",
  primitive: primitiveTier,
  semantic: {
    light: group(
      Object.entries(rootVars).filter(
        ([k]) => !isPrimitive(k) && !FUNCTIONAL.includes(k) && !isMotion(k) && !k.startsWith(SHADOW_PREFIX)
      )
    ),
    dark: group(
      Object.entries(darkVars).filter(([k]) => !FUNCTIONAL.includes(k))
    ),
  },
  functional: {
    light: group(Object.entries(rootVars).filter(([k]) => FUNCTIONAL.includes(k))),
    dark:  group(Object.entries(darkVars).filter(([k]) => FUNCTIONAL.includes(k))),
  },
  elevation: group(Object.entries(rootVars).filter(([k]) => k.startsWith(SHADOW_PREFIX))),
  motion:    group(Object.entries(rootVars).filter(([k]) => isMotion(k))),
};

const counts = Object.fromEntries(
  Object.entries(tokens)
    .filter(([k]) => !k.startsWith("$"))
    .map(([k, v]) => [
      k,
      "light" in v
        ? Object.keys(v.light).length + Object.keys(v.dark).length
        : Object.keys(v).length,
    ])
);

writeFileSync(join(root, "tokens.json"), JSON.stringify(tokens, null, 2) + "\\n");
console.log("tokens.json written:", counts);
