#!/usr/bin/env node
/**
 * Export the 3-tier token system from app/globals.css to tokens.json
 * (W3C Design Tokens-flavoured, grouped by tier and mode) so design tools
 * (Figma Tokens / Tokens Studio) and other platforms can consume it.
 *
 *   npm run tokens
 */
import { readFileSync, writeFileSync } from "node:fs";
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
    for (const d of m[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      out[d[1]] = d[2].trim();
    }
  }
  return out;
}

const rootVars = declarations(":root");
const darkVars = declarations("\\.dark");

const PRIMITIVE_PREFIXES = ["neutral-", "blue-", "green-", "red-", "amber-"];
const FUNCTIONAL = ["success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground"];
const MOTION_PREFIXES = ["duration-", "ease-"];
const SHADOW_PREFIX = "shadow-";

const isPrimitive = (k) => PRIMITIVE_PREFIXES.some((p) => k.startsWith(p));
const isMotion = (k) => MOTION_PREFIXES.some((p) => k.startsWith(p));

const typeOf = (key, value) => {
  if (key.startsWith("duration-")) return "duration";
  if (key.startsWith("ease-")) return "cubicBezier";
  if (key.startsWith("shadow-")) return "shadow";
  if (key === "radius" || /^(spacing|text)-/.test(key)) return "dimension";
  if (/oklch|rgb|#|hsl/.test(value)) return "color";
  return "other";
};

const token = (key, value) => ({ $value: value, $type: typeOf(key, value) });

const group = (entries) =>
  Object.fromEntries(entries.map(([k, v]) => [k, token(k, v)]));

const tokens = {
  $description:
    "ScnTw Design System tokens — generated from app/globals.css by scripts/export-tokens.mjs. Do not edit by hand.",
  primitive: group(Object.entries(rootVars).filter(([k]) => isPrimitive(k))),
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
    dark: group(Object.entries(darkVars).filter(([k]) => FUNCTIONAL.includes(k))),
  },
  elevation: group(Object.entries(rootVars).filter(([k]) => k.startsWith(SHADOW_PREFIX))),
  motion: group(Object.entries(rootVars).filter(([k]) => isMotion(k))),
};

const counts = Object.fromEntries(
  Object.entries(tokens)
    .filter(([k]) => !k.startsWith("$"))
    .map(([k, v]) => [
      k,
      "light" in v ? Object.keys(v.light).length + Object.keys(v.dark).length : Object.keys(v).length,
    ])
);

writeFileSync(join(root, "tokens.json"), JSON.stringify(tokens, null, 2) + "\n");
console.log("tokens.json written:", counts);
