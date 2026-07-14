/**
 * Style Dictionary v4 — ScnTw Design System
 *
 * Reads tokens.json (W3C Design Token format, OKLCH values)
 * and emits platform-specific files:
 *
 *   platform-outputs/web/        → CSS custom properties  (Tailwind / web)
 *   platform-outputs/ios/        → Swift Color + Typography extensions (iOS / watchOS)
 *   platform-outputs/android/    → colors.xml + dimens.xml + ScnTwTokens.kt (Android / Wear OS)
 *   platform-outputs/rn/         → tokens.ts  (React Native / NativeWind)
 *
 * Run:  npm run build:tokens
 *
 * OKLCH is converted to sRGB hex for native platforms via culori.
 * The web output keeps OKLCH so Tailwind/CSS gets the full colour space.
 */

import StyleDictionary from "style-dictionary";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { parse, converter, formatHex, formatRgb } from "culori";

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── OKLCH helpers ────────────────────────────────────────────────────────────

const toSrgb = converter("srgb");

/** Parse any CSS colour string (incl. oklch with / alpha) → hex.
 *  Falls back to the original value if parsing fails (e.g. shadow strings). */
function oklchToHex(raw) {
  if (!raw || typeof raw !== "string") return raw;
  // oklch() with alpha uses the form oklch(L C H / A) — culori handles this.
  try {
    const parsed = parse(raw.trim());
    if (!parsed) return raw;
    const rgb = toSrgb(parsed);
    if (!rgb) return raw;
    // Clamp channels to [0,1] (out-of-gamut oklch colours)
    rgb.r = Math.max(0, Math.min(1, rgb.r));
    rgb.g = Math.max(0, Math.min(1, rgb.g));
    rgb.b = Math.max(0, Math.min(1, rgb.b));
    if (rgb.alpha !== undefined && rgb.alpha < 1) {
      // Return rgba() for colours with alpha
      return formatRgb({ ...rgb, mode: "rgb" });
    }
    return formatHex(rgb);
  } catch {
    return raw;
  }
}

/** Clamp a 0-1 float to a 0-255 int. */
const to255 = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255);

/** Convert oklch string → { r, g, b, a } in 0-255 range. */
function oklchToRgba255(raw) {
  try {
    const parsed = parse(raw.trim());
    if (!parsed) return null;
    const rgb = toSrgb(parsed);
    if (!rgb) return null;
    return {
      r: to255(rgb.r),
      g: to255(rgb.g),
      b: to255(rgb.b),
      a: rgb.alpha !== undefined ? Math.round(rgb.alpha * 255) : 255,
    };
  } catch {
    return null;
  }
}

// ─── Load tokens ──────────────────────────────────────────────────────────────

const tokensPath = join(__dir, "tokens.json");
const rawTokens = JSON.parse(readFileSync(tokensPath, "utf8"));

/**
 * Style Dictionary expects a flat-ish token tree where every leaf is
 * { $value, $type }.  Our tokens.json uses a nested structure:
 *   { primitive: { "neutral-50": { $value, $type } },
 *     semantic:  { light: { background: { $value, $type } }, dark: { … } },
 *     … }
 *
 * We flatten this into two SD source trees: `light` and `dark`, each containing
 * primitive + elevation + motion tokens (mode-independent) plus the relevant
 * semantic/functional tier.
 */

function flattenPrimitives(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}-${k}` : k;
    if (v && typeof v === "object" && "$value" in v) {
      out[key] = v;
    } else if (v && typeof v === "object") {
      Object.assign(out, flattenPrimitives(v, key));
    }
  }
  return out;
}

function buildModeTokens(mode /* 'light' | 'dark' */) {
  return {
    primitive:  flattenPrimitives(rawTokens.primitive  ?? {}),
    elevation:  flattenPrimitives(rawTokens.elevation  ?? {}),
    motion:     flattenPrimitives(rawTokens.motion     ?? {}),
    semantic:   flattenPrimitives(rawTokens.semantic?.[mode]   ?? {}),
    functional: flattenPrimitives(rawTokens.functional?.[mode] ?? {}),
  };
}

// ─── Custom transforms ────────────────────────────────────────────────────────

// Native platforms: OKLCH colour → hex / rgba
StyleDictionary.registerTransform({
  name: "color/oklch-to-hex",
  type: "value",
  filter: (token) => token.$type === "color",
  transform: (token) => oklchToHex(token.$value),
});

// Shadow values: convert embedded oklch() colours inside the shadow string
StyleDictionary.registerTransform({
  name: "shadow/oklch-to-hex",
  type: "value",
  filter: (token) => token.$type === "shadow",
  transform: (token) => {
    // Replace each oklch(…) / oklch(… / …) call in the string
    return token.$value.replace(/oklch\([^)]+\)/g, (match) => oklchToHex(match));
  },
});

// Token name: convert "primitive-neutral-50" → "--primitive-neutral-50" for CSS
StyleDictionary.registerTransform({
  name: "name/css-var",
  type: "name",
  transform: (token) => {
    const path = token.path.join("-");
    return `--${path}`;
  },
});

// Token name: camelCase for Swift / JS
StyleDictionary.registerTransform({
  name: "name/camel-path",
  type: "name",
  transform: (token) => {
    return token.path
      .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
      .join("")
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  },
});

// Token name: SCREAMING_SNAKE for Android XML / Kotlin constants
StyleDictionary.registerTransform({
  name: "name/android-const",
  type: "name",
  transform: (token) => token.path.join("_").replace(/-/g, "_").toUpperCase(),
});

// Duration: strip "ms" for Android (dimens use plain numbers) - keep as-is here
// since we output motion separately.

// ─── Custom formats ───────────────────────────────────────────────────────────

/** CSS — emits :root { --primitive-...: oklch(...); … } */
StyleDictionary.registerFormat({
  name: "css/scntw-variables",
  format: ({ dictionary, options }) => {
    const selector = options.selector ?? ":root";
    const lines = dictionary.allTokens.map(
      (t) => `  ${t.name}: ${t.$value};`
    );
    return `/* ScnTw Design System — generated by sd.config.mjs. Do not edit by hand. */\n${selector} {\n${lines.join("\n")}\n}\n`;
  },
});

/** Swift — Color + Double extensions */
StyleDictionary.registerFormat({
  name: "swift/scntw",
  format: ({ dictionary }) => {
    const colors = dictionary.allTokens.filter((t) => t.$type === "color");
    const durations = dictionary.allTokens.filter((t) => t.$type === "duration");
    const shadows = dictionary.allTokens.filter((t) => t.$type === "shadow");

    const colorLines = colors
      .map((t) => {
        const rgba = oklchToRgba255(t.$value);
        if (!rgba) return null;
        const r = (rgba.r / 255).toFixed(4);
        const g = (rgba.g / 255).toFixed(4);
        const b = (rgba.b / 255).toFixed(4);
        const a = (rgba.a / 255).toFixed(4);
        return `    static let ${t.name} = Color(red: ${r}, green: ${g}, blue: ${b}, opacity: ${a})`;
      })
      .filter(Boolean);

    const durationLines = durations.map(
      (t) => `    static let ${t.name}: Double = ${parseFloat(t.$value) / 1000}`
    );

    return [
      "// ScnTw Design System — generated by sd.config.mjs. Do not edit by hand.",
      "import SwiftUI",
      "",
      "public extension Color {",
      "    enum ScnTw {",
      ...colorLines,
      "    }",
      "}",
      "",
      "public enum ScnTwMotion {",
      ...durationLines,
      "}",
      "",
    ].join("\n");
  },
});

/** Android colors.xml */
StyleDictionary.registerFormat({
  name: "android/scntw-colors",
  format: ({ dictionary }) => {
    const colors = dictionary.allTokens.filter((t) => t.$type === "color");
    const lines = colors
      .map((t) => {
        const rgba = oklchToRgba255(t.$value);
        if (!rgba) return null;
        const hex8 =
          rgba.a < 255
            ? `#${rgba.a.toString(16).padStart(2, "0")}${rgba.r.toString(16).padStart(2, "0")}${rgba.g.toString(16).padStart(2, "0")}${rgba.b.toString(16).padStart(2, "0")}`
            : `#${rgba.r.toString(16).padStart(2, "0")}${rgba.g.toString(16).padStart(2, "0")}${rgba.b.toString(16).padStart(2, "0")}`;
        return `    <color name="${t.name.toLowerCase()}">${hex8}</color>`;
      })
      .filter(Boolean);
    return [
      '<?xml version="1.0" encoding="utf-8"?>',
      "<!-- ScnTw Design System — generated by sd.config.mjs. Do not edit by hand. -->",
      "<resources>",
      ...lines,
      "</resources>",
      "",
    ].join("\n");
  },
});

/** Android / Kotlin constants */
StyleDictionary.registerFormat({
  name: "android/scntw-kotlin",
  format: ({ dictionary }) => {
    const colors = dictionary.allTokens.filter((t) => t.$type === "color");
    const durations = dictionary.allTokens.filter((t) => t.$type === "duration");

    const colorLines = colors
      .map((t) => {
        const rgba = oklchToRgba255(t.$value);
        if (!rgba) return null;
        const argb =
          (rgba.a << 24) | (rgba.r << 16) | (rgba.g << 8) | rgba.b;
        const hex = (argb >>> 0).toString(16).toUpperCase().padStart(8, "0");
        return `    val ${t.name} = Color(0x${hex})`;
      })
      .filter(Boolean);

    const durationLines = durations.map(
      (t) => `    val ${t.name} = ${parseFloat(t.$value).toLong()}L`
    );

    return [
      "// ScnTw Design System — generated by sd.config.mjs. Do not edit by hand.",
      "package com.scntw.ds.tokens",
      "",
      "import androidx.compose.ui.graphics.Color",
      "",
      "object ScnTwColors {",
      ...colorLines,
      "}",
      "",
      "object ScnTwMotion {",
      ...durationLines.map((l) => l.replace(".toLong()", "")),
      "}",
      "",
    ].join("\n");
  },
});

/** React Native / NativeWind — TypeScript constants */
StyleDictionary.registerFormat({
  name: "rn/scntw-ts",
  format: ({ dictionary }) => {
    const colors = dictionary.allTokens.filter((t) => t.$type === "color");
    const durations = dictionary.allTokens.filter((t) => t.$type === "duration");

    const colorLines = colors.map(
      (t) => `  '${t.name}': '${oklchToHex(t.$value)}',`
    );
    const durationLines = durations.map(
      (t) => `  '${t.name}': ${parseFloat(t.$value)},`
    );

    return [
      "// ScnTw Design System — generated by sd.config.mjs. Do not edit by hand.",
      "// Use with NativeWind: import { colors } from '@/tokens';",
      "",
      "export const colors = {",
      ...colorLines,
      "} as const;",
      "",
      "export const motion = {",
      ...durationLines,
      "} as const;",
      "",
      "export type ColorToken = keyof typeof colors;",
      "export type MotionToken = keyof typeof motion;",
      "",
    ].join("\n");
  },
});

// ─── Build ────────────────────────────────────────────────────────────────────

const MODES = ["light", "dark"];

for (const mode of MODES) {
  const tokens = buildModeTokens(mode);
  const selector = mode === "light" ? ":root" : ".dark";

  const sd = new StyleDictionary({
    tokens,
    log: { verbosity: "silent" },
    preprocessors: [],
    platforms: {
      // ── Web CSS ──────────────────────────────────────────────────────────
      css: {
        transforms: ["name/css-var"],
        buildPath: `platform-outputs/web/`,
        files: [
          {
            destination: `tokens-${mode}.css`,
            format: "css/scntw-variables",
            options: { selector },
          },
        ],
      },

      // ── iOS / watchOS — Swift ─────────────────────────────────────────
      swift: {
        transforms: ["color/oklch-to-hex", "shadow/oklch-to-hex", "name/camel-path"],
        buildPath: `platform-outputs/ios/`,
        files: [
          {
            destination: `ScnTwTokens${mode === "dark" ? "Dark" : ""}.swift`,
            format: "swift/scntw",
          },
        ],
      },

      // ── Android / Wear OS ─────────────────────────────────────────────
      android: {
        transforms: ["color/oklch-to-hex", "shadow/oklch-to-hex", "name/android-const"],
        buildPath: `platform-outputs/android/`,
        files: [
          {
            destination: `colors_${mode}.xml`,
            format: "android/scntw-colors",
          },
          {
            destination: `ScnTwTokens${mode === "dark" ? "Dark" : ""}.kt`,
            format: "android/scntw-kotlin",
          },
        ],
      },

      // ── React Native / NativeWind ─────────────────────────────────────
      rn: {
        transforms: ["color/oklch-to-hex", "name/camel-path"],
        buildPath: `platform-outputs/rn/`,
        files: [
          {
            destination: `tokens-${mode}.ts`,
            format: "rn/scntw-ts",
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
  console.log(`✓ Built ${mode} tokens`);
}

console.log("\n✅ ScnTw token pipeline complete.");
console.log("   platform-outputs/web/        → CSS (Tailwind / web)");
console.log("   platform-outputs/ios/         → Swift (iOS / watchOS)");
console.log("   platform-outputs/android/     → XML + Kotlin (Android / Wear OS)");
console.log("   platform-outputs/rn/          → TypeScript (React Native / NativeWind)");
