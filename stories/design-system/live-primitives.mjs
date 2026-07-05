/**
 * live-primitives.mjs — pure helpers for the in-Storybook primitive editor (ADR-103).
 *
 * No DOM, no deps: parse/format the oklch() strings TokenOS emits, and retint the neutral
 * ramp (keep each stop's lightness, apply a shared hue + chroma). The .stories.tsx view
 * reads the live values off :root, calls these, and setProperty()s the result back.
 * Unit-tested in live-primitives.test.mjs (node --test) so the browser view stays a thin shell.
 */

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r = (n, d = 4) => parseFloat(Number(n).toFixed(d));

/** Parse "oklch(L C H)" / "oklch(L C H / a)" → {l,c,h,a} (a defaults 1). null if not oklch. */
export function parseOklch(str) {
  const m = String(str).trim().match(
    /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/i
  );
  if (!m) return null;
  return { l: +m[1], c: +m[2], h: +m[3], a: m[4] === undefined ? 1 : +m[4] };
}

/** Format {l,c,h,a} → oklch() string (alpha omitted when 1). */
export function formatOklch({ l, c, h, a = 1 }) {
  const base = `oklch(${r(clamp(l, 0, 1))} ${r(Math.max(0, c))} ${r(((h % 360) + 360) % 360)}`;
  return Math.abs(a - 1) > 1e-6 ? `${base} / ${r(clamp(a, 0, 1))})` : `${base})`;
}

/** The editable ramps + the semantic anchor each status colour draws from (per the emitted graph). */
export const RAMPS = ["neutral", "red", "green", "blue", "amber"];
export const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
/** Direct single-swatch knobs → the primitive stop they write (what each visibly drives). */
export const ANCHORS = [
  { key: "--primitive-neutral-900", label: "Primary / buttons", note: "primary, foreground, ring route here" },
  { key: "--primitive-red-600",     label: "Destructive",       note: "destructive / error" },
  { key: "--primitive-green-600",   label: "Success",           note: "success" },
  { key: "--primitive-blue-600",    label: "Info",              note: "info" },
  { key: "--primitive-amber-500",   label: "Warning",           note: "warning anchor" },
];

/**
 * Retint the neutral ramp: keep each stop's L, apply a shared hue + chroma.
 * @param current  { "--primitive-neutral-50": "oklch(…)", … } live values read off :root
 * @param hue      0–360
 * @param chroma   0–~0.05 (0 = pure grey)
 * @returns        { varName: newOklchString } for every stop we could parse
 */
export function retintNeutral(current, hue, chroma) {
  const out = {};
  for (const stop of STOPS) {
    const name = `--primitive-neutral-${stop}`;
    const ok = parseOklch(current[name]);
    if (!ok) continue;
    out[name] = formatOklch({ l: ok.l, c: Math.max(0, chroma), h: hue, a: ok.a });
  }
  return out;
}

/** Convert an sRGB hex (#rrggbb, from <input type=color>) to an oklch() string. Small, exact,
 *  dependency-free (sRGB→linear→OKLab→OKLCH, Björn Ottosson's matrices). */
export function hexToOklch(hex) {
  const m = String(hex).trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const toLin = (u) => { u /= 255; return u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; };
  const rL = toLin((int >> 16) & 255), gL = toLin((int >> 8) & 255), bL = toLin(int & 255);
  const l_ = Math.cbrt(0.4122214708 * rL + 0.5363325363 * gL + 0.0514459929 * bL);
  const m_ = Math.cbrt(0.2119034982 * rL + 0.6806995451 * gL + 0.1073969566 * bL);
  const s_ = Math.cbrt(0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return formatOklch({ l: L, c: C, h: H });
}
