// contrast.ts — pure, dependency-free colour math shared across the design
// system (charts + diagrams). No React, no cytoscape, so it runs in Node tests
// and anywhere. oklch → sRGB (Björn Ottosson's OKLab matrix) + WCAG contrast.

export function oklchToRgb(str: string): string {
  const m = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return str;
  let L = parseFloat(m[1]);
  if (m[1].includes("%")) L /= 100;
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]);
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  let l = L + 0.3963377774 * a + 0.2158037573 * b;
  let mm = L - 0.1055613458 * a - 0.0638541728 * b;
  let s = L - 0.0894841775 * a - 1.291485548 * b;
  l = l * l * l; mm = mm * mm * mm; s = s * s * s;
  const lr = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s;
  const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055);
  const ch = (x: number) => Math.max(0, Math.min(255, Math.round(gamma(x) * 255)));
  return `rgb(${ch(lr)}, ${ch(lg)}, ${ch(lb)})`;
}

function toRGB(str: string): [number, number, number] {
  const s = str.trim().toLowerCase().startsWith("oklch") ? oklchToRgb(str) : str.trim();
  if (s.startsWith("#")) {
    const h = s.slice(1);
    const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) { const p = m[1].split(",").map((x) => parseFloat(x)); return [p[0] || 0, p[1] || 0, p[2] || 0]; }
  return [0, 0, 0];
}
function relLum([r, g, b]: [number, number, number]): number {
  const f = (c: number) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
/** WCAG 2.x contrast ratio (1–21) between two CSS colours (oklch tokens ok). */
export function contrastRatio(a: string, b: string): number {
  const la = relLum(toRGB(a)), lb = relLum(toRGB(b));
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
/** The most readable foreground for a background, by measured contrast. */
export function readableOn(bg: string, candidates: string[] = ["#ffffff", "#111111"]): string {
  let best = candidates[0], bestC = -1;
  for (const c of candidates) { const cr = contrastRatio(bg, c); if (cr > bestC) { bestC = cr; best = c; } }
  return best;
}
function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t), g = Math.round(a[1] + (b[1] - a[1]) * t), bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}
/** Keep a hue but darken/lighten it just enough to meet a contrast ratio. */
export function ensureContrast(color: string, bg: string, min = 4.5): string {
  if (contrastRatio(color, bg) >= min) return color;
  const bgLight = relLum(toRGB(bg)) > 0.4;
  const target: [number, number, number] = bgLight ? [17, 17, 17] : [255, 255, 255];
  const c = toRGB(color);
  for (let t = 0.15; t <= 1.0001; t += 0.15) { const m = mix(c, target, t); if (contrastRatio(m, bg) >= min) return m; }
  return bgLight ? "#111111" : "#ffffff";
}
