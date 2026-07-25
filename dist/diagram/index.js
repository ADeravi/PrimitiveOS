// components/diagram/Diagram.tsx
import * as React6 from "react";
import cytoscape2 from "cytoscape";
import elk from "cytoscape-elk";
import fcose2 from "cytoscape-fcose";
import ELK from "elkjs/lib/elk.bundled.js";

// components/charts/network.tsx
import * as React3 from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import avsdf from "cytoscape-avsdf";

// components/ui/label.tsx
import { Label as LabelPrimitive } from "radix-ui";

// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// components/ui/label.tsx
import { jsx } from "react/jsx-runtime";

// components/ui/slider.tsx
import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";

// components/ui/switch.tsx
import { Switch as SwitchPrimitive } from "radix-ui";
import { jsx as jsx3 } from "react/jsx-runtime";

// components/ui/button.tsx
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { jsx as jsx4 } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[length:var(--state-focus-ring-width,3px)] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-[var(--state-disabled-opacity)] aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--semantic-primary-hover)]",
        destructive: "bg-destructive text-white hover:bg-[var(--semantic-destructive-hover)] focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-[var(--semantic-input-hover)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[var(--semantic-secondary-hover)]",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-[var(--semantic-accent-hover)]",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// components/ui/segmented-control.tsx
import { jsx as jsx5 } from "react/jsx-runtime";

// components/charts/chart-card.tsx
import * as React2 from "react";
import { Download } from "lucide-react";

// components/ui/card.tsx
import { jsx as jsx6 } from "react/jsx-runtime";

// components/ui/dropdown-menu.tsx
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { jsx as jsx7, jsxs as jsxs2 } from "react/jsx-runtime";

// components/charts/chart-card.tsx
import { jsx as jsx8, jsxs as jsxs3 } from "react/jsx-runtime";

// components/foundation/contrast.ts
function oklchToRgb(str) {
  const m = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return str;
  let L = parseFloat(m[1]);
  if (m[1].includes("%")) L /= 100;
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]);
  const hr = H * Math.PI / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  let l = L + 0.3963377774 * a + 0.2158037573 * b;
  let mm = L - 0.1055613458 * a - 0.0638541728 * b;
  let s = L - 0.0894841775 * a - 1.291485548 * b;
  l = l * l * l;
  mm = mm * mm * mm;
  s = s * s * s;
  const lr = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s;
  const gamma = (x) => x <= 31308e-7 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
  const ch = (x) => Math.max(0, Math.min(255, Math.round(gamma(x) * 255)));
  return `rgb(${ch(lr)}, ${ch(lg)}, ${ch(lb)})`;
}
function toRGB(str) {
  const s = str.trim().toLowerCase().startsWith("oklch") ? oklchToRgb(str) : str.trim();
  if (s.startsWith("#")) {
    const h = s.slice(1);
    const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const p = m[1].split(",").map((x) => parseFloat(x));
    return [p[0] || 0, p[1] || 0, p[2] || 0];
  }
  return [0, 0, 0];
}
function relLum([r, g, b]) {
  const f = (c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(a, b) {
  const la = relLum(toRGB(a)), lb = relLum(toRGB(b));
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
function readableOn(bg, candidates = ["#ffffff", "#111111"]) {
  let best = candidates[0], bestC = -1;
  for (const c of candidates) {
    const cr = contrastRatio(bg, c);
    if (cr > bestC) {
      bestC = cr;
      best = c;
    }
  }
  return best;
}
function mix(a, b, t) {
  const r = Math.round(a[0] + (b[0] - a[0]) * t), g = Math.round(a[1] + (b[1] - a[1]) * t), bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}
function ensureContrast(color, bg, min = 4.5) {
  if (contrastRatio(color, bg) >= min) return color;
  const bgLight = relLum(toRGB(bg)) > 0.4;
  const target = bgLight ? [17, 17, 17] : [255, 255, 255];
  const c = toRGB(color);
  for (let t = 0.15; t <= 1.0001; t += 0.15) {
    const m = mix(c, target, t);
    if (contrastRatio(m, bg) >= min) return m;
  }
  return bgLight ? "#111111" : "#ffffff";
}

// components/charts/network.tsx
import { jsx as jsx9, jsxs as jsxs4 } from "react/jsx-runtime";
try {
  cytoscape.use(fcose);
  cytoscape.use(dagre);
  cytoscape.use(avsdf);
} catch {
}
function oklchToRgb2(str) {
  const m = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return str;
  let L = parseFloat(m[1]);
  if (m[1].includes("%")) L /= 100;
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]);
  const hr = H * Math.PI / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  let l = L + 0.3963377774 * a + 0.2158037573 * b;
  let mm = L - 0.1055613458 * a - 0.0638541728 * b;
  let s = L - 0.0894841775 * a - 1.291485548 * b;
  l = l * l * l;
  mm = mm * mm * mm;
  s = s * s * s;
  const lr = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s;
  const gamma = (x) => x <= 31308e-7 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
  const ch = (x) => Math.max(0, Math.min(255, Math.round(gamma(x) * 255)));
  return `rgb(${ch(lr)}, ${ch(lg)}, ${ch(lb)})`;
}
function resolvedBg(el) {
  let node = el;
  for (let i = 0; node && i < 5; i++, node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "transparent" && !/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)) return bg;
  }
  return "";
}
function resolvedVar(el, name, fallback) {
  try {
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none";
    probe.style.color = `var(${name})`;
    el.appendChild(probe);
    const c = getComputedStyle(probe).color;
    el.removeChild(probe);
    return c && !/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(c) ? c : fallback;
  } catch {
    return fallback;
  }
}
function isDarkColor(rgb) {
  const m = rgb.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (!m) return false;
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}
function readTokens(el) {
  const cs = getComputedStyle(el);
  const v = (n, fb) => {
    const raw = cs.getPropertyValue(n).trim() || fb;
    return raw.toLowerCase().startsWith("oklch") ? oklchToRgb2(raw) : raw;
  };
  const bg = v("--background", "#fff");
  const fg = v("--foreground", "#111");
  return {
    c: [1, 2, 3, 4, 5].map((i) => v(`--chart-${i}`, "#888")),
    border: v("--border", "#ddd"),
    fg,
    mutedF: v("--muted-foreground", "#888"),
    bg,
    // A guaranteed-parseable, theme-correct chip background: prefer the actual
    // rendered pixels; if nothing concrete is found (token is an unparseable
    // triplet / the canvas is the UA default), derive it from the FOREGROUND —
    // dark fg ⇒ light canvas, light fg ⇒ dark canvas. Never an unparseable string.
    bgSolid: resolvedBg(el) || (isDarkColor(fg) ? "#ffffff" : "#111111"),
    // AI-provenance accent (Tenet 9), resolved through the --rose → --crimson-9
    // chain to a concrete colour the canvas can paint.
    rose: resolvedVar(el, "--rose", "#d6336c"),
    primary: v("--primary", "#333"),
    // A RESOLVED font stack (the active layer's font). Cytoscape paints labels
    // to <canvas> and can't measure the CSS keyword "inherit", which silently
    // wedges the label texture so font-size changes never re-raster.
    font: cs.fontFamily || "system-ui, sans-serif"
  };
}

// components/diagram/GroupLayer.tsx
import * as React4 from "react";

// components/diagram/grouping.ts
function detectGroups(nodes, edges) {
  const ids = nodes.map((n) => n.id);
  const idset = new Set(ids);
  const nbr = new Map(ids.map((id) => [id, /* @__PURE__ */ new Set()]));
  edges.forEach((e) => {
    if (idset.has(e.source) && idset.has(e.target) && e.source !== e.target) {
      nbr.get(e.source).add(e.target);
      nbr.get(e.target).add(e.source);
    }
  });
  const shareNeighbour = (u, v) => {
    const a = nbr.get(u), b = nbr.get(v);
    for (const x of a) if (b.has(x)) return true;
    return false;
  };
  const strong = edges.filter((e) => idset.has(e.source) && idset.has(e.target) && e.source !== e.target && shareNeighbour(e.source, e.target));
  if (strong.length === 0) return new Map(ids.map((id) => [id, "g0"]));
  const parent = new Map(ids.map((id) => [id, id]));
  const find = (a) => {
    while (parent.get(a) !== a) {
      parent.set(a, parent.get(parent.get(a)));
      a = parent.get(a);
    }
    return a;
  };
  const union = (a, b) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb);
  };
  strong.forEach((e) => union(e.source, e.target));
  const size = /* @__PURE__ */ new Map();
  ids.forEach((id) => size.set(find(id), (size.get(find(id)) || 0) + 1));
  ids.forEach((id) => {
    if (size.get(find(id)) !== 1) return;
    const counts = /* @__PURE__ */ new Map();
    for (const x of nbr.get(id)) {
      const r = find(x);
      if (r !== find(id) && size.get(r) > 1) counts.set(r, (counts.get(r) || 0) + 1);
    }
    if (counts.size) {
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
      parent.set(find(id), best);
    }
  });
  const remap = /* @__PURE__ */ new Map();
  let k = 0;
  return new Map(ids.map((id) => {
    const r = find(id);
    if (!remap.has(r)) remap.set(r, "g" + k++);
    return [id, remap.get(r)];
  }));
}
function groupOf(nodes, detected) {
  const explicit = new Map(nodes.map((n) => [n.id, n.group != null ? String(n.group) : void 0]));
  return (id) => explicit.get(id) ?? detected?.get(id) ?? "g0";
}
function convexHull(points) {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
function centroid(pts) {
  const s = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  return { x: s.x / pts.length, y: s.y / pts.length };
}
function padHull(hull, pad) {
  if (hull.length === 0) return hull;
  const c = centroid(hull);
  return hull.map((p) => {
    const dx = p.x - c.x, dy = p.y - c.y, len = Math.hypot(dx, dy) || 1;
    return { x: p.x + dx / len * pad, y: p.y + dy / len * pad };
  });
}
function hullPath(centres, pad = 22, radius = 16) {
  if (centres.length === 0) return "";
  if (centres.length === 1) {
    const { x, y } = centres[0];
    const r = pad + radius;
    return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  }
  const hull = padHull(convexHull(centres), pad);
  if (hull.length < 3) {
    const [a, b] = [hull[0], hull[hull.length - 1]];
    const ang = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
    const r = pad + radius * 0.6;
    const ox = Math.cos(ang) * r, oy = Math.sin(ang) * r;
    return `M ${a.x + ox} ${a.y + oy} L ${b.x + ox} ${b.y + oy} L ${b.x - ox} ${b.y - oy} L ${a.x - ox} ${a.y - oy} Z`;
  }
  const n = hull.length;
  const along = (from, to, dist2) => {
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const t = Math.min(dist2, len) / len;
    return { x: from.x + dx * t, y: from.y + dy * t };
  };
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n], cur = hull[i], next = hull[(i + 1) % n];
    const lenPrev = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const lenNext = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.max(0, Math.min(radius, lenPrev / 2, lenNext / 2));
    const entry = along(cur, prev, r);
    const exit = along(cur, next, r);
    d += i === 0 ? `M ${entry.x} ${entry.y} ` : `L ${entry.x} ${entry.y} `;
    d += `Q ${cur.x} ${cur.y} ${exit.x} ${exit.y} `;
  }
  return d + "Z";
}
function laneBands(nodes, laneOrder, bounds, opts = {}) {
  const pad = opts.pad ?? 18;
  const byLane = /* @__PURE__ */ new Map();
  laneOrder.forEach((l) => byLane.set(l, []));
  nodes.forEach((n) => {
    if (n.lane != null && byLane.has(n.lane)) byLane.get(n.lane).push(n);
  });
  const x = bounds.minX - pad;
  const w = bounds.maxX - bounds.minX + pad * 2;
  return laneOrder.map((lane, index) => {
    const members = byLane.get(lane) || [];
    const ys = members.map((n) => n.y ?? 0);
    const hs = members.map((n) => (n.h ?? 36) / 2);
    const top = members.length ? Math.min(...ys.map((y, i) => y - hs[i])) - pad : 0;
    const bot = members.length ? Math.max(...ys.map((y, i) => y + hs[i])) + pad : 0;
    return { lane, index, y: top, h: Math.max(1, bot - top), x, w };
  });
}
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function proximityReport(nodes, edges = [], gOf) {
  const placed = nodes.filter((n) => n.x != null && n.y != null);
  const g = gOf ?? groupOf(nodes);
  const groups = /* @__PURE__ */ new Map();
  placed.forEach((n) => {
    const k = g(n.id);
    (groups.get(k) || groups.set(k, []).get(k)).push(n);
  });
  const cents = /* @__PURE__ */ new Map();
  groups.forEach((arr, k) => cents.set(k, centroid(arr.map((n) => ({ x: n.x, y: n.y })))));
  let cohSum = 0, cohN = 0;
  groups.forEach((arr, k) => arr.forEach((n) => {
    cohSum += dist({ x: n.x, y: n.y }, cents.get(k));
    cohN++;
  }));
  const cohesion = cohN ? cohSum / cohN : 0;
  const cs = [...cents.entries()];
  let sepSum = 0, sepN = 0;
  for (const [k, c] of cs) {
    let nearest = Infinity;
    for (const [k2, c2] of cs) if (k2 !== k) nearest = Math.min(nearest, dist(c, c2));
    if (nearest < Infinity) {
      sepSum += nearest;
      sepN++;
    }
  }
  const separation = sepN ? sepSum / sepN : 0;
  const gaps = [];
  for (let i = 0; i < placed.length; i++) {
    let nn = Infinity;
    for (let j = 0; j < placed.length; j++) if (i !== j) nn = Math.min(nn, dist({ x: placed[i].x, y: placed[i].y }, { x: placed[j].x, y: placed[j].y }));
    if (nn < Infinity) gaps.push(nn);
  }
  gaps.sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
  const accidental = [];
  for (let i = 0; i < placed.length; i++)
    for (let j = i + 1; j < placed.length; j++) {
      if (g(placed[i].id) === g(placed[j].id)) continue;
      const d = dist({ x: placed[i].x, y: placed[i].y }, { x: placed[j].x, y: placed[j].y });
      if (d < medianGap * 0.9) accidental.push({ a: placed[i].id, b: placed[j].id, d: Math.round(d) });
    }
  const nbrGroups = /* @__PURE__ */ new Map();
  edges.forEach((e) => {
    (nbrGroups.get(e.source) || nbrGroups.set(e.source, /* @__PURE__ */ new Set()).get(e.source)).add(g(e.target));
    (nbrGroups.get(e.target) || nbrGroups.set(e.target, /* @__PURE__ */ new Set()).get(e.target)).add(g(e.source));
  });
  const bridges = [...nbrGroups.entries()].filter(([, s]) => s.size >= 2).map(([id]) => id);
  return {
    groups: groups.size,
    cohesion: Math.round(cohesion),
    separation: Math.round(separation),
    ratio: cohesion ? Number((separation / cohesion).toFixed(2)) : 0,
    accidental,
    bridges
  };
}
function regionOverlaps(nodes, gOf) {
  const placed = nodes.filter((n) => n.x != null && n.y != null);
  const g = gOf ?? groupOf(nodes);
  const groups = /* @__PURE__ */ new Map();
  placed.forEach((n) => {
    const k = g(n.id);
    (groups.get(k) || groups.set(k, []).get(k)).push(n);
  });
  const circ = [];
  groups.forEach((arr, k) => {
    const cx = arr.reduce((s, n) => s + n.x, 0) / arr.length;
    const cy = arr.reduce((s, n) => s + n.y, 0) / arr.length;
    const r = Math.max(...arr.map((n) => Math.hypot(n.x - cx, n.y - cy) + Math.max(n.w || 0, n.h || 0) / 2));
    circ.push({ k, cx, cy, r });
  });
  const pairs = [];
  for (let i = 0; i < circ.length; i++)
    for (let j = i + 1; j < circ.length; j++) {
      const a = circ[i], b = circ[j];
      const d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
      if (d < a.r + b.r) pairs.push({ a: a.k, b: b.k, overlap: Math.round(a.r + b.r - d) });
    }
  return pairs;
}
function edgeLengthReport(nodes, edges = [], factor = 2.5) {
  const pos = new Map(nodes.filter((n) => n.x != null).map((n) => [n.id, n]));
  const lens = [];
  for (const e of edges) {
    const a = pos.get(e.source), b = pos.get(e.target);
    if (a && b) lens.push(Math.hypot(a.x - b.x, a.y - b.y));
  }
  if (!lens.length) return { median: 0, max: 0, longEdges: 0 };
  const sorted = [...lens].sort((x, y) => x - y);
  const median = sorted[Math.floor(sorted.length / 2)] || 1;
  const max = sorted[sorted.length - 1];
  const longEdges = lens.filter((l) => l > median * factor).length;
  return { median: Math.round(median), max: Math.round(max), longEdges };
}
function chooseEncoding(input) {
  if (input.ordered) return "lanes";
  if (input.overlap || input.groupCount > 7) return "color";
  if (input.groupCount >= 2) return "enclosure";
  return "color";
}

// components/diagram/GroupLayer.tsx
import { jsx as jsx10, jsxs as jsxs5 } from "react/jsx-runtime";
function GroupLayer({ cy, mode, keyOf, order, colors, labelOf, labelColor, bg }) {
  const [tf, setTf] = React4.useState({ x: 0, y: 0, z: 1 });
  const [shapes, setShapes] = React4.useState([]);
  React4.useEffect(() => {
    if (!cy) return;
    let raf = 0;
    const colorFor = (key) => {
      const keys = order && order.length ? order : [...new Set(cy.nodes().map((n) => keyOf(n.id())))].sort();
      const i = Math.max(0, keys.indexOf(key));
      return colors[i % colors.length];
    };
    const recompute = () => {
      raf = 0;
      setTf({ x: cy.pan().x, y: cy.pan().y, z: cy.zoom() });
      const gnodes = cy.nodes().map((n) => {
        const p = n.position();
        return { id: n.id(), x: p.x, y: p.y, w: n.width(), h: n.height(), group: keyOf(n.id()), lane: keyOf(n.id()) };
      });
      if (!gnodes.length) {
        setShapes([]);
        return;
      }
      if (mode === "lanes") {
        const lanes = order && order.length ? order : [...new Set(gnodes.map((n) => n.lane))];
        const minX = Math.min(...gnodes.map((n) => n.x - (n.w || 0) / 2));
        const maxX = Math.max(...gnodes.map((n) => n.x + (n.w || 0) / 2));
        const bands = laneBands(gnodes, lanes, { minX, maxX }, { pad: 30 });
        setShapes(
          bands.map((b) => ({
            key: b.lane,
            color: colorFor(b.lane),
            band: { x: b.x, y: b.y, w: b.w, h: b.h },
            labelXY: { x: b.x + 10, y: b.y + 16 }
          }))
        );
        return;
      }
      const groups = /* @__PURE__ */ new Map();
      gnodes.forEach((n) => {
        const k = n.group;
        (groups.get(k) || groups.set(k, []).get(k)).push(n);
      });
      const out = [];
      groups.forEach((arr, key) => {
        const corners = [];
        arr.forEach((n) => {
          const hw = (n.w || 40) / 2, hh = (n.h || 24) / 2;
          corners.push(
            { x: n.x - hw, y: n.y - hh },
            { x: n.x + hw, y: n.y - hh },
            { x: n.x + hw, y: n.y + hh },
            { x: n.x - hw, y: n.y + hh }
          );
        });
        const shortEdge = Math.min(...arr.map((n) => Math.min(n.w || 40, n.h || 24)));
        const pad = Math.max(12, shortEdge * 0.5);
        const cx = arr.reduce((s, n) => s + n.x, 0) / arr.length;
        const topY = Math.min(...arr.map((n) => n.y - (n.h || 24) / 2)) - pad - 10;
        out.push({ key, color: colorFor(key), path: hullPath(corners, pad, 18), labelXY: { x: cx, y: topY } });
      });
      setShapes(out);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(recompute);
    };
    cy.on("render pan zoom resize position add remove layoutstop", schedule);
    schedule();
    return () => {
      cy.off("render pan zoom resize position add remove layoutstop", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cy, mode, keyOf, order, colors, labelOf]);
  return /* @__PURE__ */ jsx10("svg", { style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }, "aria-hidden": true, children: /* @__PURE__ */ jsx10("g", { transform: `translate(${tf.x} ${tf.y}) scale(${tf.z})`, children: shapes.map((s) => {
    const labelFill = labelColor || ensureContrast(s.color, bg || "#ffffff", 4.5);
    return s.band ? /* @__PURE__ */ jsxs5("g", { children: [
      /* @__PURE__ */ jsx10("rect", { x: s.band.x, y: s.band.y, width: s.band.w, height: s.band.h, rx: 8, fill: s.color, fillOpacity: 0.06, stroke: s.color, strokeOpacity: 0.35, strokeWidth: 1 / tf.z }),
      labelOf && s.labelXY && /* @__PURE__ */ jsx10("text", { x: s.labelXY.x, y: s.labelXY.y, fontSize: 12 / tf.z, fontWeight: 700, fill: labelFill, children: labelOf(s.key) })
    ] }, s.key) : /* @__PURE__ */ jsxs5("g", { children: [
      /* @__PURE__ */ jsx10("path", { d: s.path, fill: s.color, fillOpacity: 0.08, stroke: s.color, strokeOpacity: 0.4, strokeWidth: 1.5 / tf.z }),
      labelOf && s.labelXY && /* @__PURE__ */ jsx10("text", { x: s.labelXY.x, y: s.labelXY.y, textAnchor: "middle", fontSize: 12 / tf.z, fontWeight: 700, fill: labelFill, children: labelOf(s.key) })
    ] }, s.key);
  }) }) });
}

// components/diagram/EdgeLayer.tsx
import * as React5 from "react";

// components/foundation/primitives.ts
var SPACING = [2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160];
var sp = (step) => SPACING[Math.max(1, Math.min(SPACING.length, step)) - 1];
var TYPE = {
  title: { size: 16, weight: 600, line: 1.375 },
  // heading-compact-02
  nodeLabel: { size: 14, weight: 400, line: 1.43 },
  // body-compact-01
  edgeLabel: { size: 12, weight: 400, line: 1.34 },
  // label-01 / caption-01
  caption: { size: 12, weight: 400, line: 1.34 }
};
var OPACITY = {
  solid: 1,
  label: 0.8,
  // edge-label text — 80% of the foreground (≈80% black on light)
  ghost: 0.6,
  // uncertain element shown but muted (Tenet 8)
  inferred: 0.45,
  // AI/derived connection (Tenet 9)
  exploreEdge: 0.4,
  // force/cluster web edge (dim by default, Tenet 5)
  similarityEdge: 0.3,
  // distance-true web edge
  dimNode: 0.18,
  // faded node when a neighbourhood is focused
  hullFill: 0.1,
  // group-region wash
  fadedEdge: 0.08
  // faded edge when a neighbourhood is focused
};
var RESERVED_OPACITY = new Set(Object.values(OPACITY));
var RADIUS = { sharp: 0, sm: 4, md: 8, pill: 20 };
var STROKE = { hair: 1, regular: 1.5, bold: 2, heavy: 2.5 };
var GRAY = {
  0: "#ffffff",
  10: "#f4f4f4",
  20: "#e0e0e0",
  30: "#c6c6c6",
  40: "#a8a8a8",
  50: "#8d8d8d",
  60: "#6f6f6f",
  70: "#525252",
  80: "#393939",
  90: "#262626",
  100: "#161616",
  1e3: "#000000"
};
function neutralRoles(light) {
  return light ? { surface: GRAY[10], surfaceAlt: GRAY[0], text: GRAY[100], textSoft: GRAY[70], border: GRAY[20], borderStrong: GRAY[50], line: GRAY[30] } : { surface: GRAY[90], surfaceAlt: GRAY[100], text: GRAY[10], textSoft: GRAY[40], border: GRAY[70], borderStrong: GRAY[50], line: GRAY[60] };
}

// components/diagram/edgeLint.ts
function rectsOverlap(a, b, pad = 2) {
  return a.x < b.x + b.w - pad && a.x + a.w > b.x + pad && a.y < b.y + b.h - pad && a.y + a.h > b.y + pad;
}
var CHAR_W = 7.4;
var LBL_H = 20;
function placeLabel(points, textLen, boxes, taken = []) {
  const w = textLen * CHAR_W + 12, h = LBL_H;
  const segs = [];
  for (let i = 0; i < points.length - 1; i++) segs.push([points[i], points[i + 1]]);
  segs.sort((p, q) => Math.hypot(q[1].x - q[0].x, q[1].y - q[0].y) - Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y));
  const ts = [0.5, 0.38, 0.62, 0.26, 0.74];
  for (const [p, q] of segs) {
    for (const t of ts) {
      const cx2 = p.x + (q.x - p.x) * t, cy2 = p.y + (q.y - p.y) * t;
      const r = { x: cx2 - w / 2, y: cy2 - h / 2, w, h };
      const hitsNode = boxes.some((b) => rectsOverlap(r, b));
      const hitsLabel = taken.some((o) => rectsOverlap(r, o));
      if (!hitsNode && !hitsLabel) return { x: cx2, y: cy2, clear: true, rect: r };
    }
  }
  const f = segs[0] ?? [points[0], points[points.length - 1]];
  const cx = (f[0].x + f[1].x) / 2, cy = (f[0].y + f[1].y) / 2;
  return { x: cx, y: cy, clear: false, rect: { x: cx - w / 2, y: cy - h / 2, w, h } };
}

// components/diagram/EdgeLayer.tsx
import { jsx as jsx11, jsxs as jsxs6 } from "react/jsx-runtime";
function EdgeLayer({ cy, routes, plans, labels }) {
  const [tf, setTf] = React5.useState({ x: 0, y: 0, z: 1 });
  const [col, setCol] = React5.useState({ edge: "#8a8a8a", bg: "#ffffff", text: "#333333", rose: "#d6336c" });
  React5.useEffect(() => {
    if (!cy) return;
    let raf = 0;
    const recompute = () => {
      raf = 0;
      setTf({ x: cy.pan().x, y: cy.pan().y, z: cy.zoom() });
      const el = cy.container();
      if (el) {
        const t = readTokens(el);
        const light = readableOn(t.bgSolid, ["#000000", "#ffffff"]) === "#000000";
        const n = neutralRoles(light);
        setCol({
          edge: n.line,
          // neutral connector step (light divider)
          bg: n.surfaceAlt,
          // chip at the END of the ramp (white / near-black)
          text: n.text,
          // opposite END — strong, never mid-grey
          rose: t.rose
          // AI-provenance accent for inferred edges (Tenet 9)
        });
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(recompute);
    };
    cy.on("render pan zoom resize", schedule);
    schedule();
    return () => {
      cy.off("render pan zoom resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cy]);
  const planByIdx = React5.useMemo(() => new Map(plans.map((p) => [p.index, p])), [plans]);
  const boxes = React5.useMemo(() => cy ? cy.nodes().map((n) => {
    const p = n.position();
    return { id: n.id(), x: p.x - n.width() / 2, y: p.y - n.height() / 2, w: n.width(), h: n.height() };
  }) : [], [cy, tf]);
  const placedLabels = [];
  return /* @__PURE__ */ jsx11("svg", { style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }, "aria-hidden": true, children: /* @__PURE__ */ jsx11("g", { transform: `translate(${tf.x} ${tf.y}) scale(${tf.z})`, children: routes.map((r) => {
    if (!r.points || r.points.length < 2) return null;
    const p = planByIdx.get(r.index);
    const d = "M " + r.points.map((pt) => `${pt.x} ${pt.y}`).join(" L ");
    const dash = p?.dashed ? "5 4" : void 0;
    const a = r.points[r.points.length - 1], b = r.points[r.points.length - 2];
    const ang = Math.atan2(a.y - b.y, a.x - b.x);
    const s = 9;
    const arrow = p && p.directed ? `${a.x},${a.y} ${a.x - s * Math.cos(ang - 0.45)},${a.y - s * Math.sin(ang - 0.45)} ${a.x - s * Math.cos(ang + 0.45)},${a.y - s * Math.sin(ang + 0.45)}` : null;
    const lbl = labels[r.index];
    let chip = null;
    if (lbl) {
      const at = placeLabel(r.points, lbl.length, boxes, placedLabels);
      placedLabels.push(at.rect);
      const mx = at.x, my = at.y;
      const fs = 12, w = lbl.length * fs * 0.62 + 12, h = fs + 8;
      chip = /* @__PURE__ */ jsxs6("g", { children: [
        /* @__PURE__ */ jsx11("rect", { x: mx - w / 2, y: my - h / 2, width: w, height: h, rx: 4, fill: col.bg, stroke: col.edge, strokeWidth: 1 }),
        /* @__PURE__ */ jsx11("text", { x: mx, y: my, textAnchor: "middle", dominantBaseline: "central", fontSize: fs, fill: col.text, children: lbl })
      ] });
    }
    const stroke = p?.inferred ? col.rose : col.edge;
    return /* @__PURE__ */ jsxs6("g", { children: [
      /* @__PURE__ */ jsx11("path", { d, fill: "none", stroke, strokeWidth: 1.6, strokeDasharray: dash, strokeLinejoin: "round", opacity: 0.95 }),
      arrow && /* @__PURE__ */ jsx11("polygon", { points: arrow, fill: stroke }),
      chip
    ] }, r.index);
  }) }) });
}

// components/diagram/mds.ts
function graphDistances(ids, edges) {
  const idx = new Map(ids.map((id, i) => [id, i]));
  const n = ids.length;
  const adj = ids.map(() => []);
  edges.forEach((e) => {
    const a = idx.get(e.source), b = idx.get(e.target);
    if (a != null && b != null && a !== b) {
      adj[a].push(b);
      adj[b].push(a);
    }
  });
  const D = ids.map(() => new Array(n).fill(Infinity));
  for (let s = 0; s < n; s++) {
    D[s][s] = 0;
    const q = [s];
    let h = 0;
    while (h < q.length) {
      const u = q[h++];
      for (const v of adj[u]) if (D[s][v] === Infinity) {
        D[s][v] = D[s][u] + 1;
        q.push(v);
      }
    }
  }
  let dia = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][j] !== Infinity) dia = Math.max(dia, D[i][j]);
  const big = dia + 2;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][j] === Infinity) D[i][j] = big;
  return D;
}
function mdsPositions(ids, edges, opts = {}) {
  const n = ids.length;
  if (n === 0) return { pos: {}, stress: 0 };
  if (n === 1) return { pos: { [ids[0]]: { x: 0, y: 0 } }, stress: 0 };
  const iters = opts.iters ?? 200;
  const scale = opts.scale ?? 60;
  const D = graphDistances(ids, edges);
  let X = ids.map((_, i) => {
    const a = 2 * Math.PI * i / n;
    return [Math.cos(a) * n, Math.sin(a) * n];
  });
  const eps = 1e-6;
  for (let it = 0; it < iters; it++) {
    const Xn = X.map(() => [0, 0]);
    for (let i = 0; i < n; i++) {
      let nx = 0, ny = 0, cnt = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = X[i][0] - X[j][0], dy = X[i][1] - X[j][1];
        let dist2 = Math.hypot(dx, dy);
        if (dist2 < eps) dist2 = eps;
        nx += X[j][0] + D[i][j] * dx / dist2;
        ny += X[j][1] + D[i][j] * dy / dist2;
        cnt++;
      }
      Xn[i][0] = nx / cnt;
      Xn[i][1] = ny / cnt;
    }
    X = Xn;
  }
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const dist2 = Math.hypot(X[i][0] - X[j][0], X[i][1] - X[j][1]);
    num += (dist2 - D[i][j]) ** 2;
    den += D[i][j] ** 2;
  }
  const stress = den > 0 ? Math.sqrt(num / den) : 0;
  const pos = {};
  ids.forEach((id, i) => {
    pos[id] = { x: X[i][0] * scale, y: X[i][1] * scale };
  });
  return { pos, stress: Number(stress.toFixed(3)) };
}

// components/diagram/layout.ts
var CHAR_W2 = 7.4;
var LINE_H = Math.round(TYPE.nodeLabel.size * TYPE.nodeLabel.line);
var PAD_X = sp(5);
var PAD_Y = sp(4);
function wrap(label, max = 18) {
  const words = label.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [label];
}
function sizeFor(n, role) {
  const head = n.label || n.id;
  const allLines = [...wrap(head), ...role === "entity" ? n.attrs || [] : []];
  const longest = Math.max(1, ...allLines.map((l) => l.length));
  const textW = longest * CHAR_W2, textH = allLines.length * LINE_H;
  let w = Math.min(240, Math.max(76, textW + PAD_X * 2));
  let h = Math.max(40, textH + PAD_Y * 2);
  if (role === "decision") {
    w = textW * 1.8 + PAD_X * 2;
    h = textH * 1.9 + PAD_Y * 2;
  } else if (role === "io") {
    w = textW + PAD_X * 3;
  } else if (role === "start" || role === "end") {
    w = Math.max(76, textW + PAD_X * 2.2);
  }
  return { w: Math.round(w), h: Math.round(h) };
}
var BOX_ROLES = /* @__PURE__ */ new Set([
  "process",
  "start",
  "end",
  "state",
  "subprocess",
  "node",
  "actor",
  "io"
]);
function uniformSizes(nodes, roleOf, opts = {}) {
  const natural = new Map(nodes.map((n) => [n.id, sizeFor(n, roleOf(n))]));
  const boxNat = nodes.filter((n) => BOX_ROLES.has(roleOf(n))).map((n) => natural.get(n.id));
  const uniW = boxNat.length ? Math.min(240, Math.max(96, ...boxNat.map((s) => s.w))) : 120;
  const uniH = boxNat.length ? Math.max(...boxNat.map((s) => s.h)) : 44;
  const out = /* @__PURE__ */ new Map();
  for (const n of nodes) {
    const role = roleOf(n);
    if (opts.similarity) {
      const deg = opts.degOf?.(n.id) ?? 0;
      const d = 14 + Math.min(16, deg * 2);
      out.set(n.id, { w: d, h: d });
      continue;
    }
    if (role === "decision") out.set(n.id, natural.get(n.id));
    else if (role === "entity") out.set(n.id, { w: Math.max(uniW, natural.get(n.id).w), h: natural.get(n.id).h });
    else if (BOX_ROLES.has(role)) out.set(n.id, { w: uniW, h: uniH });
    else out.set(n.id, natural.get(n.id));
  }
  return out;
}
function elkOptions(kind, tune) {
  const dir = tune?.direction || (kind === "er" || kind === "swimlane" ? "RIGHT" : "DOWN");
  const cl = (v, fb) => Math.min(2, Math.max(0.5, v && v > 0 ? v : fb));
  const s = cl(tune?.spacing, 1);
  const sx = cl(tune?.spacingX, s);
  const sy = cl(tune?.spacingY, s);
  const horizontalFlow = dir === "RIGHT" || dir === "LEFT";
  const layerGap = horizontalFlow ? sx : sy;
  const inLayerGap = horizontalFlow ? sy : sx;
  const scale = (v, m) => Math.round(v * m);
  return {
    "elk.algorithm": "layered",
    "elk.direction": dir,
    "elk.layered.spacing.nodeNodeBetweenLayers": scale(kind === "tree" ? sp(9) : sp(10), layerGap),
    // 48 / 64 @ 1
    "elk.spacing.nodeNode": scale(sp(8), inLayerGap),
    // 40 @ 1
    "elk.layered.spacing.edgeNodeBetweenLayers": scale(sp(6), layerGap),
    // 24 @ 1
    // ── ALIGNMENT / OVERLAP POLICY ──────────────────────────────────────────
    // Two edges sharing a lane are drawn as ONE line: the reader can't see there
    // are two, nor where either goes. These three keep them apart at the source,
    // so the linter's route.overlapsEdge should never have anything to report.
    "elk.layered.spacing.edgeEdgeBetweenLayers": scale(sp(4), layerGap),
    // parallel edges get their own lane
    "elk.spacing.edgeEdge": scale(sp(3), inLayerGap),
    // and stay apart within one
    "elk.layered.mergeEdges": false,
    // never fuse two edges into one trunk
    // Labels are placed by our own placer (edgeLint.placeLabel), but ELK still
    // needs to reserve room for them or they land on top of the routes.
    "elk.spacing.edgeLabel": 8,
    "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
    "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.layered.crossingMinimization.semiInteractive": kind === "tree"
  };
}
var LAYOUT_SPACING = {
  padX: PAD_X,
  padY: PAD_Y,
  betweenLayers: sp(10),
  betweenLayersTree: sp(9),
  nodeNode: sp(8),
  edgeNode: sp(6)
};

// components/diagram/edgePolicy.ts
function planEdges(kind, nodes, edges, roleOf) {
  const horizontal = kind === "er" || kind === "swimlane";
  const IN = horizontal ? "WEST" : "NORTH";
  const OUT = horizontal ? "EAST" : "SOUTH";
  const SIDE_A = horizontal ? "NORTH" : "WEST";
  const SIDE_B = horizontal ? "SOUTH" : "EAST";
  const outIdx = /* @__PURE__ */ new Map();
  edges.forEach((e, i) => {
    const a = outIdx.get(e.source) ?? [];
    a.push(i);
    outIdx.set(e.source, a);
  });
  const inCount = /* @__PURE__ */ new Map();
  edges.forEach((e) => inCount.set(e.target, (inCount.get(e.target) || 0) + 1));
  return edges.map((e, i) => {
    const role = roleOf(e.source);
    const sib = outIdx.get(e.source);
    const pos = sib.indexOf(i);
    const n = sib.length;
    const inferred = !!e.inferred;
    const dashed = e.kind === "no" || e.kind === "async" || e.kind === "return" || !!e.unknown || inferred;
    const directed = kind !== "er";
    let sourceSide = OUT, fan = "chain", budget = 1;
    if (role === "decision" && n >= 2) {
      if (pos === 0) {
        sourceSide = OUT;
        fan = "branchPrimary";
        budget = 1;
      } else {
        sourceSide = pos % 2 ? SIDE_B : SIDE_A;
        fan = "branchSecondary";
        budget = 2;
      }
    } else if (n === 2) {
      sourceSide = pos === 0 ? SIDE_A : SIDE_B;
      fan = "split";
      budget = 2;
    } else if (n >= 3) {
      sourceSide = OUT;
      fan = "fanout";
      budget = 2;
    } else if ((inCount.get(e.target) || 0) >= 2) {
      sourceSide = OUT;
      fan = "merge";
      budget = 2;
    }
    return { index: i, source: e.source, target: e.target, sourceSide, targetSide: IN, fan, budget, dashed, directed, inferred };
  });
}
var portId = (node, side) => `${node}@@${side}`;
function buildElkGraph(kind, nodeIds, sizeOf, plans, partitionOf, tune) {
  const sides = /* @__PURE__ */ new Map();
  nodeIds.forEach((id) => sides.set(id, /* @__PURE__ */ new Set()));
  plans.forEach((p) => {
    sides.get(p.source)?.add(p.sourceSide);
    sides.get(p.target)?.add(p.targetSide);
  });
  const layoutOptions = {};
  for (const [k, v] of Object.entries(elkOptions(kind, tune))) layoutOptions[k] = String(v);
  layoutOptions["elk.edgeRouting"] = "ORTHOGONAL";
  if (partitionOf) layoutOptions["elk.partitioning.activate"] = "true";
  return {
    id: "root",
    layoutOptions,
    children: nodeIds.map((id) => {
      const { w, h } = sizeOf(id);
      return {
        id,
        width: w,
        height: h,
        layoutOptions: {
          "elk.portConstraints": "FIXED_SIDE",
          ...partitionOf ? { "elk.partitioning.partition": String(partitionOf(id)) } : {}
        },
        ports: [...sides.get(id)].map((side) => ({ id: portId(id, side), layoutOptions: { "elk.port.side": side } }))
      };
    }),
    edges: plans.map((p) => ({ id: "e" + p.index, sources: [portId(p.source, p.sourceSide)], targets: [portId(p.target, p.targetSide)] }))
  };
}
function extractRoutes(elkResult) {
  const boxes = (elkResult.children ?? []).map((c) => ({ id: c.id, x: c.x, y: c.y, w: c.width, h: c.height }));
  const routes = (elkResult.edges ?? []).map((e) => {
    const s = e.sections?.[0];
    const points = s ? [s.startPoint, ...s.bendPoints ?? [], s.endPoint] : [];
    return { index: Number(String(e.id).replace(/^e/, "")), points };
  });
  return { boxes, routes };
}

// components/diagram/Diagram.tsx
import { jsx as jsx12, jsxs as jsxs7 } from "react/jsx-runtime";
var SIDE_ENDPOINT = { NORTH: "0% -50%", SOUTH: "0% 50%", EAST: "50% 0%", WEST: "-50% 0%" };
var ELK_ROUTED = /* @__PURE__ */ new Set(["flow", "tree", "state", "er"]);
function once(fn) {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    fn();
  };
}
function afterLayout(cy, fn, sync) {
  if (sync) {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(fn);
    else setTimeout(fn, 0);
  } else {
    cy.one("layoutstop", fn);
  }
}
var elkEngine = new ELK();
try {
  cytoscape2.use(elk);
  cytoscape2.use(fcose2);
} catch {
}
var KIND_FROM_INTENT = {
  flow: "flow",
  flowchart: "flow",
  process: "flow",
  pipeline: "flow",
  workflow: "flow",
  steps: "flow",
  tree: "tree",
  hierarchy: "tree",
  org: "tree",
  orgchart: "tree",
  breakdown: "tree",
  taxonomy: "tree",
  state: "state",
  states: "state",
  machine: "state",
  lifecycle: "state",
  status: "state",
  fsm: "state",
  er: "er",
  entity: "er",
  schema: "er",
  data: "er",
  model: "er",
  erd: "er",
  swimlane: "swimlane",
  lanes: "swimlane",
  responsibilities: "swimlane",
  crossfunctional: "swimlane",
  cluster: "cluster",
  clusters: "cluster",
  community: "cluster",
  communities: "cluster",
  network: "cluster",
  groups: "cluster",
  similarity: "similarity",
  similar: "similarity",
  distance: "similarity",
  embedding: "similarity",
  proximity: "similarity",
  semantic: "similarity",
  sequence: "sequence",
  interaction: "sequence",
  messages: "sequence",
  protocol: "sequence"
};
function kindFromIntent(intent) {
  const k = String(intent).toLowerCase().replace(/[^a-z]/g, "");
  if (KIND_FROM_INTENT[k]) return KIND_FROM_INTENT[k];
  for (const [word, kind] of Object.entries(KIND_FROM_INTENT)) if (k.includes(word)) return kind;
  return "flow";
}
function shapeFor(role, kind) {
  if (kind === "similarity") return "ellipse";
  switch (role) {
    case "start":
    case "end":
      return "round-rectangle";
    // terminator (pill via large corner radius)
    case "decision":
      return "diamond";
    case "io":
      return "rhomboid";
    // ISO 5807 predefined-process is a rectangle with struck sides; cut-rectangle is
    // the closest cytoscape primitive and, crucially, is not another rounded box.
    case "subprocess":
      return "cut-rectangle";
    case "entity":
      return "rectangle";
    case "state":
      return "round-rectangle";
    case "actor":
      return "round-rectangle";
    default:
      return kind === "er" ? "rectangle" : "round-rectangle";
  }
}
function colorPolicy(kind, nodeCount, groupCount) {
  if (kind === "cluster" || groupCount >= 2 || nodeCount > 10) return "rich";
  return "minimal";
}
function roleStyle(role, t, policy = "rich") {
  const light = readableOn(t.bgSolid, ["#000000", "#ffffff"]) === "#000000";
  const n = neutralRoles(light);
  let fill = n.surface, border = n.border;
  if (policy === "minimal") {
    if (role === "start" || role === "end") border = n.borderStrong;
  } else {
    const accent = t.c[0], decide = t.c[2] || t.c[0];
    const a = role === "decision" ? decide : role === "entity" ? t.c[1] || accent : role === "io" ? t.c[3] || accent : accent;
    border = ensureContrast(a, n.surface, 3);
  }
  const text = readableOn(fill, [n.text, n.surfaceAlt]);
  return { fill, border, text };
}
function labelFor(n, role) {
  const head = wrap(n.label || n.id).join("\n");
  if (role === "entity" && n.attrs && n.attrs.length) return head + "\n" + n.attrs.map((a) => "\xB7 " + a).join("\n");
  return head;
}
function layoutFor(kind, tune) {
  if (kind === "cluster") {
    return {
      name: "fcose",
      quality: "default",
      animate: false,
      randomize: true,
      packComponents: true,
      nodeRepulsion: () => 9e3,
      idealEdgeLength: () => 90,
      gravity: 0.15,
      nodeSeparation: 140,
      gravityRange: 3.4,
      numIter: 2500
    };
  }
  return elkLayout(kind, tune);
}
function elkLayout(kind, tune) {
  return {
    name: "elk",
    fit: true,
    padding: 24,
    nodeDimensionsIncludeLabels: false,
    elk: elkOptions(kind, tune)
  };
}
var MAX_NODES = 60;
function normalize(kind, nodesIn, edgesIn) {
  const notes = [];
  const seen = /* @__PURE__ */ new Set();
  let nodes = nodesIn.filter((n) => seen.has(n.id) ? false : (seen.add(n.id), true));
  if (nodes.length > MAX_NODES) {
    notes.push(`${nodes.length} elements exceeds the readable cap \u2014 showing the first ${MAX_NODES}.`);
    const keep = new Set(nodes.slice(0, MAX_NODES).map((n) => n.id));
    nodes = nodes.slice(0, MAX_NODES);
    edgesIn = edgesIn.filter((e) => keep.has(e.source) && keep.has(e.target));
  }
  const ids = new Set(nodes.map((n) => n.id));
  const refDropped = edgesIn.filter((e) => !ids.has(e.source) || !ids.has(e.target)).length;
  if (refDropped) notes.push(`${refDropped} edge(s) referenced a missing node \u2014 omitted.`);
  const eseen = /* @__PURE__ */ new Set();
  const edges = edgesIn.filter((e) => {
    if (!ids.has(e.source) || !ids.has(e.target)) return false;
    const k = e.source + "\u2192" + e.target + "\xB7" + (e.label || "");
    return eseen.has(k) ? false : (eseen.add(k), true);
  });
  const unknownN = nodes.filter((n) => n.unknown).length;
  if (unknownN) notes.push(`${unknownN} element(s) marked uncertain.`);
  if (kind === "flow") {
    const indeg = /* @__PURE__ */ new Map(), outdeg = /* @__PURE__ */ new Map();
    nodes.forEach((n) => {
      indeg.set(n.id, 0);
      outdeg.set(n.id, 0);
    });
    edges.forEach((e) => {
      outdeg.set(e.source, (outdeg.get(e.source) || 0) + 1);
      indeg.set(e.target, (indeg.get(e.target) || 0) + 1);
    });
    nodes = nodes.map((n) => {
      if (n.role) return n;
      if ((indeg.get(n.id) || 0) === 0 && edges.length) return { ...n, role: "start" };
      if ((outdeg.get(n.id) || 0) === 0 && edges.length) return { ...n, role: "end" };
      return { ...n, role: "process" };
    });
  }
  return { nodes, edges, notes };
}
function defaultRole(kind, n) {
  if (n.role) return n.role;
  if (kind === "er") return "entity";
  if (kind === "state") return "state";
  if (kind === "tree") return "node";
  return "process";
}
function Diagram({ intent = "flow", kind, nodes = [], edges = [], height = 480, showGrade = false, direction, spacing, spacingX, spacingY, showGroups = true, nodeSpreadX = 1, nodeSpreadY = 1, clusterSpreadX = 1, clusterSpreadY = 1, unsafe = false }) {
  const tune = { direction, spacing, spacingX, spacingY };
  if (unsafe && typeof console !== "undefined") {
    console.warn("<Diagram unsafe> bypasses the readability guardrails \u2014 use only for known edge cases.");
  }
  const intentKind = kindFromIntent(intent);
  const distanceMeaningless = /* @__PURE__ */ new Set(["cluster", "flow", "tree", "state", "er", "swimlane"]);
  const blocked = intentKind === "similarity" && !!kind && kind !== "similarity" && distanceMeaningless.has(kind);
  const resolvedKind = blocked ? "similarity" : kind || intentKind;
  const hostRef = React6.useRef(null);
  const cyRef = React6.useRef(null);
  const [tip, setTip] = React6.useState(null);
  const [cyState, setCyState] = React6.useState(null);
  const [palette, setPalette] = React6.useState([]);
  const [bgColor, setBgColor] = React6.useState("");
  const built = React6.useMemo(() => normalize(resolvedKind, nodes, edges), [resolvedKind, nodes, edges]);
  const grouping = React6.useMemo(() => {
    const laneMap = new Map(built.nodes.map((n) => [n.id, n.lane != null ? String(n.lane) : ""]));
    if (resolvedKind === "swimlane") {
      const order = [...new Set(built.nodes.map((n) => n.lane).filter((l) => l != null).map(String))];
      return { mode: "lanes", named: true, order, keyOf: (id) => laneMap.get(id) ?? "" };
    }
    const hasGroup = built.nodes.some((n) => n.group != null);
    if (resolvedKind === "cluster" || hasGroup) {
      const detected = resolvedKind === "cluster" && !hasGroup ? detectGroups(built.nodes, built.edges) : void 0;
      const gmap = new Map(built.nodes.map((n) => [n.id, n.group != null ? String(n.group) : detected?.get(n.id) ?? "g0"]));
      return { mode: "hulls", named: hasGroup, order: [...new Set(gmap.values())], keyOf: (id) => gmap.get(id) ?? "g0" };
    }
    return null;
  }, [built, resolvedKind]);
  const sim = React6.useMemo(
    () => resolvedKind === "similarity" ? mdsPositions(built.nodes.map((n) => n.id), built.edges) : null,
    [built, resolvedKind]
  );
  const hubLabels = React6.useMemo(() => {
    if (resolvedKind !== "similarity") return null;
    const deg = /* @__PURE__ */ new Map();
    built.edges.forEach((e) => {
      deg.set(e.source, (deg.get(e.source) || 0) + 1);
      deg.set(e.target, (deg.get(e.target) || 0) + 1);
    });
    const top = [...built.nodes].sort((a, b) => (deg.get(b.id) || 0) - (deg.get(a.id) || 0)).slice(0, Math.max(4, Math.round(built.nodes.length * 0.3)));
    return new Set(top.map((n) => n.id));
  }, [built, resolvedKind]);
  const elkRouted = ELK_ROUTED.has(resolvedKind);
  const spreadActive = clusterSpreadX !== 1 || clusterSpreadY !== 1;
  const useStaticRoutes = elkRouted && !spreadActive;
  const edgePlans = React6.useMemo(
    () => planEdges(resolvedKind, built.nodes, built.edges, (id) => {
      const n = built.nodes.find((x) => x.id === id);
      return n ? defaultRole(resolvedKind, n) : "process";
    }),
    [resolvedKind, built]
  );
  const edgeLabels = React6.useMemo(() => built.edges.map((e) => e.label || e.card || ""), [built]);
  const [edgeRoutes, setEdgeRoutes] = React6.useState([]);
  const buildStyle = React6.useCallback(
    (t) => {
      const edgeColor = neutralRoles(readableOn(t.bgSolid, ["#000000", "#ffffff"]) === "#000000").line;
      return [
        {
          selector: "node",
          style: {
            shape: "data(shape)",
            "background-color": "data(fill)",
            "background-opacity": 1,
            width: "data(w)",
            height: "data(h)",
            label: "data(label)",
            color: "data(text)",
            "font-size": `${TYPE.nodeLabel.size}px`,
            "font-family": t.font,
            // similarity points carry the hub label below the dot, not inside.
            "text-valign": resolvedKind === "similarity" ? "bottom" : "center",
            "text-halign": "center",
            "text-margin-y": resolvedKind === "similarity" ? 3 : 0,
            "text-wrap": "wrap",
            "text-max-width": "200px",
            "line-height": 1.3,
            "border-width": "data(bw)",
            "border-color": "data(border)",
            // ISO 5807: process is a RECTANGLE. md (8px) rounded it enough that a
            // process and a terminator read as the same "rounded box" — the reported
            // "all nodes look identical". sm keeps the DS softness without the
            // silhouette collapsing into the pill.
            "corner-radius": `${RADIUS.sm}px`,
            "min-zoomed-font-size": 6
          }
        },
        // ISO 5807 terminator = stadium. A radius larger than any half-height always
        // fully rounds the ends, so start/end can never be confused with a process box.
        { selector: 'node[role = "start"], node[role = "end"]', style: { "corner-radius": "999px" } },
        // Initial / final states marked CONSISTENTLY: same accent colour and the
        // same modest weight as each other (not a jarring heavy black) — final adds
        // a double ring, the state-machine convention.
        { selector: 'node[mark = "initial"]', style: { "border-width": STROKE.heavy, "border-color": t.mutedF } },
        { selector: 'node[mark = "final"]', style: { "border-width": STROKE.heavy, "border-color": t.mutedF, "border-style": "double" } },
        // Tenet 8 — uncertain elements are shown but visibly marked, not dropped.
        { selector: 'node[unknown = "1"]', style: { "border-style": "dashed", "border-color": t.mutedF, "background-opacity": OPACITY.ghost, opacity: OPACITY.ghost } },
        // Tenet 9 — AI-inferred elements carry the --rose provenance accent (dashed),
        // so inference is never mistaken for asserted fact.
        { selector: 'node[inferred = "1"]', style: { "border-style": "dashed", "border-color": t.rose, "border-width": STROKE.bold } },
        {
          selector: "edge",
          style: {
            // ELK-routed idioms draw edges in the SVG EdgeLayer (from ELK's actual
            // routes); hide cytoscape's own edge so they don't double-draw.
            display: useStaticRoutes ? "none" : "element",
            width: STROKE.regular,
            // structured idioms get crisp, darker connectors (box-and-arrow);
            // force/similarity webs stay light so they don't overpower the nodes.
            "line-color": edgeColor,
            // force/cluster/similarity read cleaner with direct curves; structured
            // idioms use orthogonal taxi routing (boxes-and-arrows).
            "curve-style": resolvedKind === "cluster" || resolvedKind === "similarity" ? "bezier" : "taxi",
            "taxi-direction": resolvedKind === "er" || resolvedKind === "swimlane" ? "horizontal" : "downward",
            "taxi-turn": "50%",
            "taxi-turn-min-distance": "8px",
            "target-arrow-color": edgeColor,
            "target-arrow-shape": resolvedKind === "er" || resolvedKind === "cluster" || resolvedKind === "similarity" ? "none" : "triangle",
            "arrow-scale": 0.95,
            label: "data(label)",
            "font-size": `${TYPE.edgeLabel.size}px`,
            "font-family": t.font,
            // Label plate: fill = the canvas background (so it knocks the connector
            // out from behind the text), a 1px border in the EDGE colour, and text
            // at 80% of the foreground (≈80% black on a light canvas). Reads as a
            // crisp chip that belongs to its edge.
            // chip = the BROWSER-RESOLVED background (t.bgSolid), so cytoscape's
            // canvas always parses it — a raw --background token (oklch/hsl) can
            // fall back to black, which was the black-box bug. Text colour is the
            // best contrast ON that chip (≈80% black on a light canvas).
            color: readableOn(t.bgSolid, ["#333333", "#dddddd"]),
            "text-background-color": t.bgSolid,
            "text-background-opacity": 1,
            "text-background-shape": "roundrectangle",
            "text-background-padding": "3px",
            "text-border-color": edgeColor,
            "text-border-width": STROKE.hair,
            "text-border-opacity": 1,
            "text-margin-y": -2,
            // Tenet 5 — exploration edges are dim by default; hover reveals. Similarity
            // edges stay light but legible (position leads, connections still readable).
            opacity: resolvedKind === "similarity" ? OPACITY.similarityEdge : resolvedKind === "cluster" ? OPACITY.exploreEdge : OPACITY.solid
          }
        },
        { selector: 'edge[kind = "no"]', style: { "line-style": "dashed", "line-color": t.mutedF } },
        { selector: 'edge[kind = "async"], edge[kind = "return"]', style: { "line-style": "dashed" } },
        // Tenet 8/9 — uncertain / inferred connections render dashed + faint.
        { selector: 'edge[unknown = "1"]', style: { "line-style": "dashed", opacity: OPACITY.inferred } },
        // Tenet 9 — AI-inferred connections in the --rose provenance accent (cluster/
        // similarity webs; ELK-routed idioms get the same accent via EdgeLayer).
        { selector: 'edge[inferred = "1"]', style: { "line-style": "dashed", "line-color": t.rose, "target-arrow-color": t.rose } },
        // Decision branches are routed by ELK's orthogonal layered router — each
        // branch keeps its own label. (Earlier custom source/target-endpoints on
        // taxi edges produced degenerate stubs / boxes at the junction.)
        { selector: "node.faded", style: { opacity: OPACITY.dimNode } },
        { selector: "edge.faded", style: { opacity: OPACITY.fadedEdge } },
        { selector: "node.hl", style: { "border-width": STROKE.heavy, "border-color": t.primary } },
        { selector: "edge.hl", style: { "line-color": t.primary, "target-arrow-color": t.primary, width: STROKE.heavy, opacity: OPACITY.solid } }
      ];
    },
    [resolvedKind, useStaticRoutes]
  );
  React6.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const t0 = readTokens(host);
    const groupCount = grouping ? grouping.order.length : 0;
    const policy = colorPolicy(resolvedKind, built.nodes.length, groupCount);
    const degMap = /* @__PURE__ */ new Map();
    built.edges.forEach((e) => {
      degMap.set(e.source, (degMap.get(e.source) || 0) + 1);
      degMap.set(e.target, (degMap.get(e.target) || 0) + 1);
    });
    const roleById = new Map(built.nodes.map((n) => [n.id, defaultRole(resolvedKind, n)]));
    const sizeMap = uniformSizes(built.nodes, (n) => roleById.get(n.id), {
      similarity: resolvedKind === "similarity",
      degOf: (id) => degMap.get(id) || 0
    });
    const elements = [
      ...built.nodes.map((n) => {
        const role = roleById.get(n.id);
        const deg = degMap.get(n.id) || 0;
        const { w, h } = sizeMap.get(n.id);
        const rs = roleStyle(role, t0, policy);
        const showLbl = !hubLabels || hubLabels.has(n.id);
        return {
          data: {
            id: n.id,
            label: showLbl ? n.unknown ? labelFor(n, role) + "  ?" : labelFor(n, role) : "",
            role,
            shape: shapeFor(role, resolvedKind),
            w,
            h,
            fill: rs.fill,
            border: rs.border,
            text: rs.text,
            // importance (rich policy only): hubs get a heavier border.
            bw: policy === "rich" ? STROKE.regular + Math.min(3, deg * 0.5) : STROKE.regular,
            mark: n.initial ? "initial" : n.final ? "final" : "",
            unknown: n.unknown ? "1" : "",
            inferred: n.inferred ? "1" : ""
          }
        };
      }),
      ...built.edges.map((e, i) => ({
        // a decision's outgoing edges get a `branch` so they can fan out of
        // different vertices instead of collapsing into one shared corridor.
        data: {
          id: `e${i}`,
          source: e.source,
          target: e.target,
          label: e.label || (e.card ? e.card : ""),
          kind: e.kind || "flow",
          branch: roleById.get(e.source) === "decision" ? e.kind || "" : "",
          unknown: e.unknown ? "1" : "",
          inferred: e.inferred ? "1" : ""
        }
      }))
    ];
    const layout = resolvedKind === "similarity" && sim ? { name: "preset", positions: sim.pos, fit: true, padding: 40 } : elkRouted ? { name: "preset", fit: true, padding: 30 } : layoutFor(resolvedKind, tune);
    const cy = cytoscape2({
      container: host,
      elements,
      style: buildStyle(t0),
      layout,
      minZoom: 0.35,
      maxZoom: 2.4,
      wheelSensitivity: 0.2,
      // ELK-routed idioms (flow/tree/state/er) paint STATIC precomputed routes via
      // EdgeLayer — the orthogonal path, including which side of each node box it
      // meets, is fixed at layout time. Leaving nodes grabbable there lets a drag move
      // the box while its routes stay put, so edges visibly detach. Lock the nodes in
      // exactly those idioms; force/exploratory kinds (cluster, similarity, sequence,
      // swimlane) keep live cytoscape routing and stay draggable.
      autoungrabify: elkRouted
    });
    cyRef.current = cy;
    setCyState(cy);
    setPalette(t0.c);
    setBgColor(t0.bg);
    if (elkRouted) {
      const graph = buildElkGraph(resolvedKind, built.nodes.map((n) => n.id), (id) => sizeMap.get(id), edgePlans, void 0, tune);
      elkEngine.layout(graph).then((res) => {
        const { boxes, routes } = extractRoutes(res);
        cy.batch(() => boxes.forEach((b) => {
          const n = cy.$id(b.id);
          if (n.nonempty()) n.position({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
        }));
        setEdgeRoutes(routes);
        if (spreadActive) applyGroupSpread(1, 1);
        cy.fit(void 0, 28);
      }).catch(() => {
      });
    }
    if (resolvedKind === "swimlane" && grouping?.order.length) {
      const order = grouping.order, LANE_H = 130;
      const snapLanes = once(() => {
        cy.batch(() => cy.nodes().forEach((node) => {
          const li = Math.max(0, order.indexOf(grouping.keyOf(node.id())));
          node.position({ x: node.position().x, y: li * LANE_H + LANE_H / 2 });
        }));
        if (spreadActive) applyGroupSpread(1, 1);
        cy.fit(void 0, 58);
      });
      afterLayout(
        cy,
        snapLanes,
        /* sync */
        false
      );
    }
    const uniform = spacingX != null || spacingY != null ? ((spacingX ?? spacingY ?? 1) + (spacingY ?? spacingX ?? 1)) / 2 : spacing ?? 1;
    const nsx = nodeSpreadX * (spacingX ?? spacing ?? 1);
    const nsy = nodeSpreadY * (spacingY ?? spacing ?? 1);
    if (resolvedKind === "similarity" && uniform !== 1) {
      afterLayout(
        cy,
        once(() => {
          const ns = cy.nodes();
          if (!ns.length) return;
          const c = ns.reduce((a, n) => ({ x: a.x + n.position().x, y: a.y + n.position().y }), { x: 0, y: 0 });
          const gc = { x: c.x / ns.length, y: c.y / ns.length };
          cy.batch(() => ns.forEach((n) => {
            const p = n.position();
            n.position({ x: gc.x + (p.x - gc.x) * uniform, y: gc.y + (p.y - gc.y) * uniform });
          }));
          if (spreadActive) applyGroupSpread(1, 1);
          cy.center();
        }),
        /* sync */
        true
      );
    }
    const applyGroupSpread = (intraX, intraY) => {
      const keyOfNode = (id) => grouping ? grouping.keyOf(id) : "";
      const members = /* @__PURE__ */ new Map();
      cy.nodes().forEach((n) => {
        const k = keyOfNode(n.id());
        const arr = members.get(k) || [];
        arr.push(n);
        members.set(k, arr);
      });
      const cent = /* @__PURE__ */ new Map();
      members.forEach((arr, k) => {
        const s = arr.reduce((a, n) => ({ x: a.x + n.position().x, y: a.y + n.position().y }), { x: 0, y: 0 });
        cent.set(k, { x: s.x / arr.length, y: s.y / arr.length });
      });
      const all = [...cent.values()];
      if (!all.length) return;
      const g = all.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
      const gc = { x: g.x / all.length, y: g.y / all.length };
      cy.batch(() => {
        members.forEach((arr, k) => {
          const c = cent.get(k);
          const nc = { x: gc.x + (c.x - gc.x) * clusterSpreadX, y: gc.y + (c.y - gc.y) * clusterSpreadY };
          arr.forEach((n) => {
            const p = n.position();
            n.position({ x: nc.x + (p.x - c.x) * intraX, y: nc.y + (p.y - c.y) * intraY });
          });
        });
      });
      cy.center();
    };
    if (resolvedKind === "cluster" && (nsx !== 1 || nsy !== 1 || spreadActive)) {
      afterLayout(
        cy,
        once(() => applyGroupSpread(nsx, nsy)),
        /* sync */
        true
      );
    }
    const isExplore = resolvedKind === "cluster";
    cy.on("mouseover", "node", (e) => {
      const p = e.target.renderedPosition();
      const raw = built.nodes.find((n) => n.id === e.target.id());
      setTip({ x: p.x, y: p.y, text: raw?.label || e.target.id() });
      if (isExplore) {
        const hood = e.target.closedNeighborhood();
        cy.elements().addClass("faded").removeClass("hl");
        hood.removeClass("faded").addClass("hl");
      }
    });
    cy.on("mousemove", "node", (e) => {
      const p = e.target.renderedPosition();
      setTip((prev) => prev ? { ...prev, x: p.x, y: p.y } : prev);
    });
    cy.on("mouseout", "node", () => {
      setTip(null);
      if (isExplore) cy.elements().removeClass("faded hl");
    });
    cy.on("tap", "node", (e) => {
      const hood = e.target.closedNeighborhood();
      cy.elements().addClass("faded").removeClass("hl");
      hood.removeClass("faded").addClass("hl");
    });
    cy.on("tap", (e) => {
      if (e.target === cy) cy.elements().removeClass("faded hl");
    });
    const planByEdgeId = new Map(edgePlans.map((p) => ["e" + p.index, p]));
    const horizontal = resolvedKind === "er" || resolvedKind === "swimlane";
    const smartRoute = () => {
      if (resolvedKind === "cluster" || resolvedKind === "similarity" || elkRouted) return;
      cy.edges().forEach((e) => {
        const p = planByEdgeId.get(e.id());
        if (!p) return;
        e.style({
          "source-endpoint": SIDE_ENDPOINT[p.sourceSide],
          "target-endpoint": SIDE_ENDPOINT[p.targetSide],
          "taxi-direction": horizontal ? "rightward" : "downward"
        });
      });
    };
    const restyle = () => {
      const el = hostRef.current;
      if (!el) return;
      const tk = readTokens(el);
      cy.batch(() => {
        cy.nodes().forEach((node) => {
          const raw = built.nodes.find((n) => n.id === node.id());
          if (!raw) return;
          const role = defaultRole(resolvedKind, raw);
          const rs = roleStyle(role, tk, policy);
          node.data("fill", rs.fill);
          node.data("border", rs.border);
          node.data("text", rs.text);
        });
      });
      cy.style(buildStyle(tk));
      setPalette(tk.c);
      setBgColor(tk.bg);
      cy.resize();
      smartRoute();
    };
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    let fitT;
    const fitPad = grouping ? 58 : 28;
    const fitNow = () => {
      cy.resize();
      smartRoute();
      cy.fit(void 0, fitPad);
      host.parentElement?.parentElement?.setAttribute("data-diagram-ready", "1");
    };
    const ro = new ResizeObserver(() => {
      clearTimeout(fitT);
      fitT = setTimeout(fitNow, 30);
    });
    ro.observe(host);
    const settle = setTimeout(fitNow, 180);
    return () => {
      clearTimeout(fitT);
      clearTimeout(settle);
      ro.disconnect();
      mo.disconnect();
      cy.destroy();
      cyRef.current = null;
      setCyState(null);
    };
  }, [built, resolvedKind, buildStyle, direction, spacing, spacingX, spacingY, nodeSpreadX, nodeSpreadY, clusterSpreadX, clusterSpreadY]);
  const notes = [
    ...blocked ? [`Blocked: a similarity intent can't ride a "${kind}" layout \u2014 showing the distance-true (MDS) embedding instead.`] : [],
    ...built.notes,
    ...sim ? [`Distance \u2248 similarity \xB7 stress ${sim.stress}${sim.stress < 0.2 ? " (trustworthy)" : sim.stress < 0.35 ? " (borderline)" : " (loose \u2014 read clusters only)"}`] : [],
    ...resolvedKind === "cluster" ? ["Force layout \u2014 distance is exploratory, not a measure of similarity."] : []
  ];
  const th = { textAlign: "left", padding: "2px 8px", borderBottom: "1px solid var(--border, #e5e5e5)", color: "var(--muted-foreground, #777)", fontWeight: 600 };
  const td = { padding: "2px 8px", borderBottom: "1px solid var(--border, #eee)", color: "var(--foreground, #222)" };
  const cap = { textAlign: "left", fontWeight: 700, padding: "0 0 4px", color: "var(--foreground, #222)" };
  return /* @__PURE__ */ jsxs7("figure", { style: { margin: 0, position: "relative", width: 720, maxWidth: "100%" }, children: [
    /* @__PURE__ */ jsxs7("div", { style: { position: "relative", height, width: "100%", borderRadius: 10, border: "1px solid var(--border, #e5e5e5)", overflow: "hidden", background: "var(--background, #fff)" }, children: [
      showGroups && grouping && cyState && /* @__PURE__ */ jsx12(
        GroupLayer,
        {
          cy: cyState,
          mode: grouping.mode,
          keyOf: grouping.keyOf,
          order: grouping.order,
          colors: palette.length ? palette : ["#888888"],
          labelOf: grouping.named ? (k) => k : void 0,
          bg: bgColor || void 0
        }
      ),
      useStaticRoutes && cyState && /* @__PURE__ */ jsx12(EdgeLayer, { cy: cyState, routes: edgeRoutes, plans: edgePlans, labels: edgeLabels }),
      /* @__PURE__ */ jsx12(
        "div",
        {
          ref: hostRef,
          style: { position: "absolute", inset: 0, zIndex: 2, background: "transparent" },
          role: "img",
          "aria-label": `${resolvedKind} diagram, ${built.nodes.length} elements`
        }
      ),
      cyState && /* @__PURE__ */ jsx12(ZoomControls, { cy: cyState })
    ] }),
    tip && /* @__PURE__ */ jsx12(
      "div",
      {
        style: {
          position: "absolute",
          left: tip.x,
          top: tip.y,
          pointerEvents: "none",
          zIndex: 10,
          transform: "translate(-50%, calc(-100% - 10px))",
          whiteSpace: "nowrap",
          background: "var(--background, #fff)",
          color: "var(--foreground, #111)",
          border: "1px solid var(--border, #e5e5e5)",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
        },
        children: tip.text
      }
    ),
    notes.length > 0 && /* @__PURE__ */ jsx12("figcaption", { style: { marginTop: 8, fontSize: 11.5, color: "var(--muted-foreground, #777)", lineHeight: 1.45 }, children: notes.join(" \xB7 ") }),
    /* @__PURE__ */ jsxs7("details", { style: { marginTop: 6, fontSize: 11.5, color: "var(--muted-foreground, #777)" }, children: [
      /* @__PURE__ */ jsx12("summary", { style: { cursor: "pointer", userSelect: "none" }, children: "Data table" }),
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 24, flexWrap: "wrap", marginTop: 8 }, children: [
        /* @__PURE__ */ jsxs7("table", { style: { borderCollapse: "collapse", fontSize: 11 }, children: [
          /* @__PURE__ */ jsxs7("caption", { style: cap, children: [
            "Elements (",
            built.nodes.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx12("thead", { children: /* @__PURE__ */ jsxs7("tr", { children: [
            /* @__PURE__ */ jsx12("th", { style: th, children: "Label" }),
            /* @__PURE__ */ jsx12("th", { style: th, children: "Role / group" })
          ] }) }),
          /* @__PURE__ */ jsx12("tbody", { children: built.nodes.map((n) => /* @__PURE__ */ jsxs7("tr", { children: [
            /* @__PURE__ */ jsx12("td", { style: td, children: (n.label || n.id) + (n.unknown ? " (uncertain)" : "") }),
            /* @__PURE__ */ jsxs7("td", { style: td, children: [
              defaultRole(resolvedKind, n),
              n.group != null ? ` \xB7 ${n.group}` : n.lane ? ` \xB7 ${n.lane}` : ""
            ] })
          ] }, n.id)) })
        ] }),
        built.edges.length > 0 && /* @__PURE__ */ jsxs7("table", { style: { borderCollapse: "collapse", fontSize: 11 }, children: [
          /* @__PURE__ */ jsxs7("caption", { style: cap, children: [
            "Connections (",
            built.edges.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx12("thead", { children: /* @__PURE__ */ jsxs7("tr", { children: [
            /* @__PURE__ */ jsx12("th", { style: th, children: "From \u2192 To" }),
            /* @__PURE__ */ jsx12("th", { style: th, children: "Label" })
          ] }) }),
          /* @__PURE__ */ jsx12("tbody", { children: built.edges.map((e, i) => /* @__PURE__ */ jsxs7("tr", { children: [
            /* @__PURE__ */ jsxs7("td", { style: td, children: [
              e.source,
              " \u2192 ",
              e.target,
              e.unknown ? " (uncertain)" : ""
            ] }),
            /* @__PURE__ */ jsx12("td", { style: td, children: e.label || e.card || "" })
          ] }, i)) })
        ] })
      ] })
    ] }),
    showGrade && /* @__PURE__ */ jsxs7(
      "span",
      {
        style: {
          position: "absolute",
          top: 10,
          right: 10,
          fontSize: 10.5,
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: 6,
          background: "var(--muted, #f4f4f5)",
          color: "var(--muted-foreground, #666)"
        },
        title: `${resolvedKind} \xB7 ${built.nodes.length} nodes \xB7 ${built.edges.length} edges`,
        children: [
          resolvedKind,
          " \xB7 ",
          built.nodes.length
        ]
      }
    )
  ] });
}
function ZoomControls({ cy }) {
  const z = (f) => {
    const level = Math.min(2.4, Math.max(0.35, cy.zoom() * f));
    cy.zoom({ level, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };
  const btn = {
    width: 30,
    height: 30,
    display: "grid",
    placeItems: "center",
    border: "none",
    background: "var(--background, #fff)",
    color: "var(--foreground, #111)",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    padding: 0
  };
  const div = { height: 1, background: "var(--border, #e5e5e5)" };
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      style: {
        position: "absolute",
        right: 10,
        bottom: 10,
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--border, #e5e5e5)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        background: "var(--background, #fff)"
      },
      role: "group",
      "aria-label": "Diagram zoom controls",
      children: [
        /* @__PURE__ */ jsx12("button", { style: btn, onClick: () => z(1.2), title: "Zoom in", "aria-label": "Zoom in", children: "+" }),
        /* @__PURE__ */ jsx12("div", { style: div }),
        /* @__PURE__ */ jsx12("button", { style: btn, onClick: () => z(1 / 1.2), title: "Zoom out", "aria-label": "Zoom out", children: "\u2212" }),
        /* @__PURE__ */ jsx12("div", { style: div }),
        /* @__PURE__ */ jsx12("button", { style: { ...btn, fontSize: 13 }, onClick: () => cy.fit(void 0, 28), title: "Fit to view", "aria-label": "Fit to view", children: "\u2922" })
      ]
    }
  );
}
var Diagram_default = Diagram;

// components/diagram/SequenceDiagram.tsx
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
var COL_GAP = 150;
var BOX_W = 120;
var BOX_H = 38;
var TOP = 14;
var ROW_GAP = 46;
var PAD_X2 = 24;
var SELF_W = 46;
function SequenceDiagram({ participants = [], messages = [], height }) {
  const idx = new Map(participants.map((p, i) => [p.id, i]));
  const colX = (i) => PAD_X2 + BOX_W / 2 + i * COL_GAP;
  const headerBottom = TOP + BOX_H;
  const firstRow = headerBottom + 34;
  const valid = messages.filter((m) => idx.has(m.source) && idx.has(m.target));
  const rowY = (r) => firstRow + r * ROW_GAP;
  const width = PAD_X2 * 2 + BOX_W + Math.max(0, participants.length - 1) * COL_GAP;
  const lifeBottom = rowY(valid.length) + 6;
  const h = height ?? lifeBottom + 16;
  return /* @__PURE__ */ jsx13("figure", { style: { margin: 0, width, maxWidth: "100%" }, "data-diagram-ready": "1", children: /* @__PURE__ */ jsxs8(
    "svg",
    {
      viewBox: `0 0 ${width} ${h}`,
      width: "100%",
      role: "img",
      "aria-label": `sequence diagram, ${participants.length} participants, ${valid.length} messages`,
      style: { fontFamily: "var(--font-sans, inherit)", display: "block" },
      children: [
        /* @__PURE__ */ jsxs8("defs", { children: [
          /* @__PURE__ */ jsx13("marker", { id: "seq-arrow", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx13("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--muted-foreground, #777)" }) }),
          /* @__PURE__ */ jsx13("marker", { id: "seq-open", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx13("path", { d: "M0,0 L10,5 L0,10", fill: "none", stroke: "var(--muted-foreground, #777)", strokeWidth: "1.4" }) })
        ] }),
        participants.map((p, i) => /* @__PURE__ */ jsx13(
          "line",
          {
            x1: colX(i),
            y1: headerBottom,
            x2: colX(i),
            y2: lifeBottom,
            stroke: "var(--border, #e5e5e5)",
            strokeWidth: "1.2",
            strokeDasharray: "4 4"
          },
          `life-${p.id}`
        )),
        participants.map((p, i) => /* @__PURE__ */ jsxs8("g", { children: [
          /* @__PURE__ */ jsx13(
            "rect",
            {
              x: colX(i) - BOX_W / 2,
              y: TOP,
              width: BOX_W,
              height: BOX_H,
              rx: "8",
              fill: "var(--background, #fff)",
              stroke: "var(--primary, #555)",
              strokeWidth: "1.6"
            }
          ),
          /* @__PURE__ */ jsx13(
            "text",
            {
              x: colX(i),
              y: TOP + BOX_H / 2,
              textAnchor: "middle",
              dominantBaseline: "central",
              fontSize: "12.5",
              fontWeight: 600,
              fill: "var(--foreground, #111)",
              children: trunc(p.label || p.id, 16)
            }
          )
        ] }, `head-${p.id}`)),
        valid.map((m, r) => {
          const from = idx.get(m.from ?? m.source);
          const to = idx.get(m.to ?? m.target);
          const y = rowY(r);
          const dashed = m.kind === "async" || m.kind === "return";
          const marker = m.kind === "return" || m.kind === "async" ? "url(#seq-open)" : "url(#seq-arrow)";
          const label = m.label || "";
          if (from === to) {
            const x = colX(from);
            return /* @__PURE__ */ jsxs8("g", { children: [
              /* @__PURE__ */ jsx13(
                "path",
                {
                  d: `M ${x} ${y - 8} h ${SELF_W} v 16 h ${-SELF_W}`,
                  fill: "none",
                  stroke: "var(--muted-foreground, #777)",
                  strokeWidth: "1.4",
                  strokeDasharray: dashed ? "5 4" : void 0,
                  markerEnd: marker
                }
              ),
              label && /* @__PURE__ */ jsx13("text", { x: x + SELF_W + 6, y: y - 2, fontSize: "11", fill: "var(--muted-foreground, #777)", children: trunc(label, 24) })
            ] }, `msg-${r}`);
          }
          const x1 = colX(from);
          const x2 = colX(to);
          const dir = x2 > x1 ? -1 : 1;
          return /* @__PURE__ */ jsxs8("g", { children: [
            label && /* @__PURE__ */ jsx13(
              "text",
              {
                x: (x1 + x2) / 2,
                y: y - 7,
                textAnchor: "middle",
                fontSize: "11",
                fill: "var(--foreground, #111)",
                children: trunc(label, 30)
              }
            ),
            /* @__PURE__ */ jsx13(
              "line",
              {
                x1: x1 + dir * 2,
                y1: y,
                x2: x2 - dir * 2,
                y2: y,
                stroke: "var(--muted-foreground, #777)",
                strokeWidth: "1.5",
                strokeDasharray: dashed ? "5 4" : void 0,
                markerEnd: marker
              }
            )
          ] }, `msg-${r}`);
        })
      ]
    }
  ) });
}
function trunc(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
}

// components/diagram/idiomPicker.ts
var INTENT_MAP = {
  explore: "force",
  overview: "force",
  connections: "force",
  network: "force",
  related: "force",
  flow: "hierarchy",
  hierarchy: "hierarchy",
  dependency: "hierarchy",
  tree: "hierarchy",
  process: "hierarchy",
  rank: "hierarchy",
  pipeline: "hierarchy",
  lineage: "hierarchy",
  similarity: "similarity",
  similar: "similarity",
  cluster: "similarity",
  embedding: "similarity",
  importance: "concentric",
  hubs: "concentric",
  centrality: "concentric",
  core: "concentric",
  time: "timeline",
  timeline: "timeline",
  chronology: "timeline",
  when: "timeline",
  trend: "timeline",
  evolution: "timeline",
  history: "timeline",
  matrix: "matrix",
  adjacency: "matrix",
  dense: "matrix",
  allpairs: "matrix",
  sequence: "circle",
  cycle: "circle",
  ring: "circle",
  circular: "circle",
  catalog: "grid",
  index: "grid",
  roster: "grid"
};
function resolveIntent(intent) {
  if (!intent) return "force";
  const k = String(intent).toLowerCase().trim();
  if (INTENT_MAP[k]) return INTENT_MAP[k];
  for (const [word, contract] of Object.entries(INTENT_MAP)) if (k.includes(word)) return contract;
  return "force";
}
function computeShape(nodes = [], edges = [], hints = {}) {
  const n = nodes.length;
  const m = edges.length;
  const density = n > 1 ? m / (n * (n - 1) / 2) : 0;
  const hasDates = hints.hasDates ?? nodes.some((x) => x.year != null || x.dated === true);
  const hasSimilarity = hints.hasSimilarity ?? nodes.some((x) => x.sim != null || x.embedded === true);
  const parent = new Map(nodes.map((x) => [x.id, x.id]));
  const find = (a) => {
    if (!parent.has(a)) return a;
    while (parent.get(a) !== a) {
      parent.set(a, parent.get(parent.get(a)));
      a = parent.get(a);
    }
    return a;
  };
  let cycle = false;
  for (const e of edges) {
    if (!parent.has(e.source) || !parent.has(e.target)) continue;
    const ra = find(e.source), rb = find(e.target);
    if (ra === rb) cycle = true;
    else parent.set(ra, rb);
  }
  const acyclic = !cycle;
  const treeLike = acyclic && m === n - 1 && n > 2;
  const deg = /* @__PURE__ */ new Map();
  edges.forEach((e) => {
    deg.set(e.source, (deg.get(e.source) || 0) + 1);
    deg.set(e.target, (deg.get(e.target) || 0) + 1);
  });
  const degs = [...deg.values()];
  const mean = degs.length ? degs.reduce((a, b) => a + b, 0) / degs.length : 0;
  const max = degs.length ? Math.max(...degs) : 0;
  const hubDominated = n > 6 && mean > 0 && max > mean * 2.5;
  return { n, m, density, dense: density > 0.4, hasDates, hasSimilarity, acyclic, treeLike, hubDominated };
}
var REASONS = {
  force: "Exploratory first look \u2014 clusters and hubs emerge from the layout.",
  hierarchy: "Directional / tree structure reads cleanest as ranked layers.",
  similarity: "Distance-true: position earns meaning from real similarity.",
  concentric: "Hub-and-periphery: importance descends from the centre.",
  circle: "Single ring \u2014 ordering carries the relationship.",
  grid: "Tidy lattice for predictable scanning of a small set.",
  matrix: "Dense relationships read better as an adjacency matrix than a hairball.",
  timeline: "Time owns the horizontal axis; order and trend are the message."
};
function pickIdiom(input = {}) {
  const { intent = "explore", nodes = [], edges = [], hints = {} } = input;
  const shape = computeShape(nodes, edges, hints);
  let contract = resolveIntent(intent);
  let confidence = "high";
  const warnings = [];
  const alternatives = [];
  if (contract === "timeline" && !shape.hasDates) {
    warnings.push("Timeline intent but no dated nodes \u2014 can't put time on the axis.");
    contract = shape.treeLike ? "hierarchy" : "force";
    confidence = "low";
  }
  if (contract === "similarity" && !shape.hasSimilarity) {
    warnings.push("Similarity intent but no similarity/embedding \u2014 distance would be accidental; using a structural layout instead.");
    contract = "force";
    confidence = "low";
  }
  if (contract === "hierarchy" && !shape.acyclic) {
    warnings.push("Hierarchy intent but the graph has cycles \u2014 layering will break them; force or matrix may read truer.");
    alternatives.push("force", "matrix");
    confidence = "medium";
  }
  if (contract === "force" && shape.dense && shape.n <= 60) {
    warnings.push(`Dense graph (density ${shape.density.toFixed(2)}) \u2014 an adjacency matrix reads better than a force hairball.`);
    contract = "matrix";
    confidence = "medium";
  } else if (contract === "force" && shape.n > 120) {
    warnings.push(`Large graph (${shape.n} nodes) \u2014 force will hairball; matrix or a clustered view scales better.`);
    alternatives.push("matrix");
    confidence = "medium";
  }
  if (contract === "force" && shape.treeLike) {
    warnings.push("Data is tree-shaped \u2014 hierarchy reads cleaner than force.");
    contract = "hierarchy";
  }
  if (contract === "force" && shape.hubDominated) alternatives.push("concentric");
  const alts = [...new Set(alternatives)].filter((a) => a !== contract);
  return { contract, confidence, reason: REASONS[contract] ?? REASONS.force, warnings, alternatives: alts, shape };
}

// components/diagram/diagramLint.ts
var DEFAULTS = {
  maxColors: 6,
  minLabelPx: 5,
  labelCharW: 0.58,
  labelPadY: 4,
  minSeparationRatio: 1.4,
  // groups should sit ≥1.4× as far apart as they are tight
  weights: {
    nodeOverlap: 0.3,
    labelOverlap: 0.22,
    edgeCrossings: 0.18,
    paletteOverflow: 0.12,
    legibility: 0.1,
    aspect: 0.04,
    contract: 0.2,
    proximity: 0.16
  }
};
var nodeRect = (n) => ({ x: (n.x ?? 0) - (n.w ?? 0) / 2, y: (n.y ?? 0) - (n.h ?? 0) / 2, w: n.w ?? 0, h: n.h ?? 0 });
function rectsOverlap2(a, b, pad = 0) {
  return a.x - pad < b.x + b.w && a.x + a.w + pad > b.x && a.y - pad < b.y + b.h && a.y + a.h + pad > b.y;
}
function labelRect(n, fontPx, cfg) {
  if (!n.label) return null;
  const w = Math.min(90, n.label.length * fontPx * cfg.labelCharW);
  const h = fontPx * 1.2;
  return { x: (n.x ?? 0) - w / 2, y: (n.y ?? 0) + (n.h ?? 0) / 2 + cfg.labelPadY, w, h };
}
function segmentsCross(p1, p2, p3, p4) {
  const o = (a, b, c) => Math.sign((b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y));
  return o(p1, p2, p3) !== o(p1, p2, p4) && o(p3, p4, p1) !== o(p3, p4, p2);
}
function computeMetrics(view, cfg) {
  const nodes = view.nodes || [];
  const edges = view.edges || [];
  const zoom = view.zoom ?? 1;
  const fontPx = 12;
  const pos = new Map(nodes.map((n) => [n.id, n]));
  let nodeHits = 0;
  const overlapping = /* @__PURE__ */ new Set();
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      if (rectsOverlap2(nodeRect(nodes[i]), nodeRect(nodes[j]))) {
        nodeHits++;
        overlapping.add(nodes[i].id);
        overlapping.add(nodes[j].id);
      }
  const labelled = nodes.filter((n) => n.label && n.showLabel !== false);
  const lboxes = labelled.map((n) => ({ id: n.id, r: labelRect(n, fontPx, cfg) }));
  let labelHits = 0;
  const labelClashers = /* @__PURE__ */ new Set();
  for (let i = 0; i < lboxes.length; i++)
    for (let j = i + 1; j < lboxes.length; j++)
      if (rectsOverlap2(lboxes[i].r, lboxes[j].r)) {
        labelHits++;
        labelClashers.add(lboxes[i].id);
        labelClashers.add(lboxes[j].id);
      }
  let crossings = 0;
  for (let i = 0; i < edges.length; i++) {
    const a1 = pos.get(edges[i].source), a2 = pos.get(edges[i].target);
    if (!a1 || !a2) continue;
    for (let j = i + 1; j < edges.length; j++) {
      const e2 = edges[j];
      if (e2.source === edges[i].source || e2.source === edges[i].target || e2.target === edges[i].source || e2.target === edges[i].target) continue;
      const b1 = pos.get(e2.source), b2 = pos.get(e2.target);
      if (b1 && b2 && segmentsCross(a1, a2, b1, b2)) crossings++;
    }
  }
  const groups = new Set(nodes.map((n) => n.group).filter((g) => g != null));
  const maxColors = view.palette?.maxColors ?? cfg.maxColors;
  const minRenderedPx = fontPx * zoom;
  const xs = nodes.map((n) => n.x ?? 0), ys = nodes.map((n) => n.y ?? 0);
  const bw = Math.max(1, Math.max(...xs) - Math.min(...xs));
  const bh = Math.max(1, Math.max(...ys) - Math.min(...ys));
  const aspect = bw / bh;
  const nPairs = Math.max(1, nodes.length * (nodes.length - 1) / 2);
  const ePairs = Math.max(1, edges.length * (edges.length - 1) / 2);
  return {
    nodes: nodes.length,
    edges: edges.length,
    nodeOverlap: { count: nodeHits, ratio: nodeHits / nPairs, ids: [...overlapping] },
    labelOverlap: { count: labelHits, ratio: labelHits / Math.max(1, labelled.length * (labelled.length - 1) / 2), ids: [...labelClashers] },
    edgeCrossings: { count: crossings, ratio: crossings / ePairs },
    palette: { groups: groups.size, max: maxColors, over: Math.max(0, groups.size - maxColors) },
    legibility: { minPx: minRenderedPx, ok: minRenderedPx >= cfg.minLabelPx },
    aspect
  };
}
function contractViolations(view) {
  const v = [];
  const nodes = view.nodes || [];
  const edges = view.edges || [];
  switch (view.contract) {
    case "similarity":
      if (edges.length > nodes.length)
        v.push({ rule: "similarity.edgesObscureDistance", severity: "warn", detail: "Distance carries the relation here; show k-NN edges sparingly, not the full edge set." });
      break;
    case "timeline": {
      const undated = nodes.filter((n) => n.dated === false);
      const misplaced = undated.filter((n) => !n.offAxis);
      if (misplaced.length)
        v.push({ rule: "timeline.undatedOnAxis", severity: "error", detail: `${misplaced.length} undated node(s) placed on the time axis; move them to the off-axis bucket.`, ids: misplaced.map((n) => n.id) });
      break;
    }
    case "force":
      if (!nodes.some((n) => n.group != null))
        v.push({ rule: "force.noGrouping", severity: "warn", detail: "Force positions are accidents \u2014 assign communities so colour/hulls carry the grouping." });
      break;
    default:
      break;
  }
  return v;
}
function validate(view, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts, weights: { ...DEFAULTS.weights, ...opts.weights || {} } };
  const m = computeMetrics(view, cfg);
  const violations = [];
  const corrections = [];
  const w = cfg.weights;
  let penalty = 0;
  if (m.nodeOverlap.count > 0) {
    violations.push({ rule: "nodeOverlap", severity: m.nodeOverlap.ratio > 0.05 ? "error" : "warn", detail: `${m.nodeOverlap.count} overlapping node pair(s).`, ids: m.nodeOverlap.ids });
    corrections.push({ action: "separateOverlaps", reason: "nodeOverlap" });
    penalty += w.nodeOverlap * Math.min(1, m.nodeOverlap.ratio * 6);
  }
  if (m.labelOverlap.count > 0) {
    violations.push({ rule: "labelOverlap", severity: "warn", detail: `${m.labelOverlap.count} colliding label(s).`, ids: m.labelOverlap.ids });
    corrections.push({ action: "thinLabels", reason: "labelOverlap" });
    penalty += w.labelOverlap * Math.min(1, m.labelOverlap.ratio * 5);
  }
  if (m.edgeCrossings.ratio > 0.1) {
    violations.push({ rule: "edgeCrossings", severity: m.edgeCrossings.ratio > 0.3 ? "error" : "warn", detail: `${m.edgeCrossings.count} edge crossings (${(m.edgeCrossings.ratio * 100).toFixed(0)}% of pairs).` });
    corrections.push({ action: "suggestIdiom", reason: "edgeCrossings", to: m.nodes <= 30 ? "hierarchy" : "matrix" });
    penalty += w.edgeCrossings * Math.min(1, m.edgeCrossings.ratio);
  }
  if (m.palette.over > 0) {
    violations.push({ rule: "paletteOverflow", severity: "error", detail: `${m.palette.groups} colour groups exceed the cap of ${m.palette.max}.` });
    corrections.push({ action: "clampPalette", reason: "paletteOverflow", max: m.palette.max });
    penalty += w.paletteOverflow * Math.min(1, m.palette.over / m.palette.max);
  }
  if (!m.legibility.ok) {
    violations.push({ rule: "legibility", severity: "warn", detail: `Labels render at ${m.legibility.minPx.toFixed(1)}px (min ${cfg.minLabelPx}px). Hide them or zoom.` });
    corrections.push({ action: "hideLabelsBelowZoom", reason: "legibility" });
    penalty += w.legibility;
  }
  if (m.nodes > 6 && (m.aspect > 3 || m.aspect < 1 / 3)) {
    violations.push({ rule: "aspect", severity: "warn", detail: `Extreme aspect ratio ${m.aspect.toFixed(2)} \u2014 re-pack or fit.` });
    corrections.push({ action: "refit", reason: "aspect" });
    penalty += w.aspect;
  }
  for (const c of contractViolations(view)) {
    violations.push(c);
    penalty += w.contract * (c.severity === "error" ? 1 : 0.4);
  }
  const positioned = (view.nodes || []).some((n) => n.x != null && n.y != null);
  const groupCount = new Set((view.nodes || []).map((n) => n.group).filter((g) => g != null)).size;
  let prox;
  if (positioned && groupCount >= 2) {
    prox = proximityReport(view.nodes || [], view.edges || []);
    if (prox.accidental.length > 0) {
      violations.push({
        rule: "proximity.accidentalAdjacency",
        severity: prox.accidental.length > 2 ? "error" : "warn",
        detail: `${prox.accidental.length} cross-group node pair(s) sit closer than the typical gap \u2014 they read as grouped but aren't.`,
        ids: [...new Set(prox.accidental.flatMap((p) => [p.a, p.b]))]
      });
      corrections.push({ action: "separateGroups", reason: "proximity.accidentalAdjacency" });
      penalty += w.proximity * Math.min(1, prox.accidental.length / 4);
    }
    if (prox.ratio > 0 && prox.ratio < cfg.minSeparationRatio) {
      violations.push({
        rule: "proximity.weakSeparation",
        severity: "warn",
        detail: `Separation/cohesion ratio ${prox.ratio} < ${cfg.minSeparationRatio}: groups aren't visually distinct \u2014 tighten clusters or add enclosure (hulls / lanes).`
      });
      corrections.push({ action: "encloseGroups", reason: "proximity.weakSeparation" });
      penalty += w.proximity * Math.min(1, cfg.minSeparationRatio - prox.ratio);
    }
    const overlaps = regionOverlaps(view.nodes || []);
    if (overlaps.length) {
      violations.push({
        rule: "grouping.regionOverlap",
        severity: "error",
        detail: `${overlaps.length} group region(s) overlap \u2014 enclosures are a membership claim and must be disjoint.`,
        ids: [...new Set(overlaps.flatMap((o) => [o.a, o.b]))]
      });
      corrections.push({ action: "separateGroups", reason: "grouping.regionOverlap" });
      penalty += w.proximity * Math.min(1, overlaps.length / 2);
    }
  }
  if (positioned && (view.edges || []).length > 3) {
    const el = edgeLengthReport(view.nodes || [], view.edges || []);
    if (el.longEdges > 0) {
      violations.push({
        rule: "proximity.longEdges",
        severity: "warn",
        detail: `${el.longEdges} edge(s) far longer than typical (max ${el.max} vs median ${el.median}) \u2014 re-arrange so related nodes sit adjacent rather than restyling the edge.`
      });
      corrections.push({ action: "rearrange", reason: "proximity.longEdges" });
      penalty += w.proximity * Math.min(0.5, el.longEdges / 6);
    }
  }
  const score = Math.max(0, Math.min(1, 1 - penalty));
  const grade = score >= 0.9 ? "A" : score >= 0.75 ? "B" : score >= 0.6 ? "C" : score >= 0.4 ? "D" : "F";
  return { score, grade, pass: grade <= "C" && !violations.some((x) => x.severity === "error"), metrics: { ...m, proximity: prox }, violations, corrections };
}
function separateOverlaps(nodes, { padding = 6, passes = 60 } = {}) {
  const out = nodes.map((n) => ({ ...n }));
  for (let p = 0; p < passes; p++) {
    let moved = false;
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i], b = out[j];
        const minX = (a.w + b.w) / 2 + padding, minY = (a.h + b.h) / 2 + padding;
        const dx = b.x - a.x, dy = b.y - a.y;
        if (Math.abs(dx) < minX && Math.abs(dy) < minY) {
          const ox = minX - Math.abs(dx), oy = minY - Math.abs(dy);
          if (ox < oy) {
            const s = (dx === 0 ? 1 : Math.sign(dx)) * ox / 2;
            a.x -= s;
            b.x += s;
          } else {
            const s = (dy === 0 ? 1 : Math.sign(dy)) * oy / 2;
            a.y -= s;
            b.y += s;
          }
          moved = true;
        }
      }
    if (!moved) break;
  }
  return out;
}
function thinLabels(nodes, { keep = 0.5 } = {}) {
  const ranked = [...nodes].sort((a, b) => (b.degree ?? 0) - (a.degree ?? 0));
  const cut = Math.max(1, Math.round(ranked.length * keep));
  const visible = new Set(ranked.slice(0, cut).map((n) => n.id));
  return nodes.map((n) => ({ ...n, showLabel: visible.has(n.id) }));
}
function clampPalette(nodes, max = DEFAULTS.maxColors) {
  const counts = /* @__PURE__ */ new Map();
  nodes.forEach((n) => counts.set(n.group, (counts.get(n.group) ?? 0) + 1));
  const keep = new Set([...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, max - 1).map(([g]) => g));
  return nodes.map((n) => ({ ...n, group: keep.has(n.group) ? n.group : "__other__" }));
}

// components/diagram/buildDiagram.ts
function withSizes(nodes, edges) {
  const deg = /* @__PURE__ */ new Map();
  edges.forEach((e) => {
    deg.set(e.source, (deg.get(e.source) || 0) + 1);
    deg.set(e.target, (deg.get(e.target) || 0) + 1);
  });
  return nodes.map((n) => {
    const d = deg.get(n.id) || 1;
    const s = Math.round(18 + Math.min(6, d) * 4);
    return { ...n, degree: d, w: n.w || s, h: n.h || s };
  });
}
var simpleLayout = (contract, nodes, edges) => {
  const W = 640, H = 420, cx = W / 2, cy = H / 2;
  const n = nodes.length || 1;
  const maxSize = Math.max(20, ...nodes.map((x) => x.w || 20));
  const placeGrid = (cols) => {
    const c = cols || Math.ceil(Math.sqrt(n));
    const gap = maxSize + 26;
    return nodes.map((nd, i) => ({ ...nd, x: 40 + i % c * gap, y: 40 + Math.floor(i / c) * gap }));
  };
  const placeRing = (items, radius, cxx = cx, cyy = cy) => items.map((nd, i) => {
    const a = i / items.length * Math.PI * 2 - Math.PI / 2;
    return { ...nd, x: cxx + radius * Math.cos(a), y: cyy + radius * Math.sin(a) };
  });
  switch (contract) {
    case "grid":
    case "matrix":
      return placeGrid();
    case "circle":
      return placeRing(nodes, Math.max(120, n * 12));
    case "concentric": {
      const sorted = [...nodes].sort((a, b) => (b.degree || 0) - (a.degree || 0));
      const rings = Math.min(4, Math.max(1, Math.ceil(n / 6)));
      const per = Math.ceil(sorted.length / rings);
      let out = [];
      for (let r = 0; r < rings; r++) out = out.concat(placeRing(sorted.slice(r * per, (r + 1) * per), 60 + r * 80));
      return out;
    }
    case "hierarchy": {
      const adj = new Map(nodes.map((nd) => [nd.id, []]));
      edges.forEach((e) => {
        if (adj.has(e.source) && adj.has(e.target)) {
          adj.get(e.source).push(e.target);
          adj.get(e.target).push(e.source);
        }
      });
      const root = [...nodes].sort((a, b) => adj.get(b.id).length - adj.get(a.id).length)[0]?.id;
      const depth = /* @__PURE__ */ new Map([[root, 0]]);
      const q = [root];
      while (q.length) {
        const u = q.shift();
        for (const v of adj.get(u) || []) if (!depth.has(v)) {
          depth.set(v, depth.get(u) + 1);
          q.push(v);
        }
      }
      const byLayer = /* @__PURE__ */ new Map();
      nodes.forEach((nd) => {
        const d = depth.get(nd.id) ?? 0;
        if (!byLayer.has(d)) byLayer.set(d, []);
        byLayer.get(d).push(nd);
      });
      const out = [];
      for (const [d, layer] of byLayer) {
        const gap = maxSize + 28;
        const total = (layer.length - 1) * gap;
        layer.forEach((nd, i) => out.push({ ...nd, x: cx - total / 2 + i * gap, y: 50 + d * 78 }));
      }
      return out;
    }
    case "timeline": {
      const years = nodes.map((nd) => nd.year).filter((y) => y != null);
      const minY = Math.min(...years, 0), maxY = Math.max(...years, 1);
      const lanes = [...new Set(nodes.map((nd) => nd.group ?? 0))];
      return nodes.map((nd, i) => {
        const t = nd.year != null && maxY > minY ? (nd.year - minY) / (maxY - minY) : i / n;
        const lane = lanes.indexOf(nd.group ?? 0);
        return { ...nd, x: 60 + t * (W - 120), y: 60 + lane * 70, offAxis: nd.dated === false };
      });
    }
    case "force":
    default: {
      let pos = placeRing(nodes, Math.max(120, n * 12));
      const idx = new Map(pos.map((p, i) => [p.id, i]));
      for (let it = 0; it < 40; it++) {
        const next = pos.map((p) => ({ ...p }));
        edges.forEach((e) => {
          const a = idx.get(e.source), b = idx.get(e.target);
          if (a == null || b == null) return;
          const mx = (pos[a].x + pos[b].x) / 2, my = (pos[a].y + pos[b].y) / 2;
          next[a].x += (mx - pos[a].x) * 0.06;
          next[a].y += (my - pos[a].y) * 0.06;
          next[b].x += (mx - pos[b].x) * 0.06;
          next[b].y += (my - pos[b].y) * 0.06;
        });
        pos = next;
      }
      return pos;
    }
  }
};
var snap = (contract, result, phase) => ({
  phase,
  contract,
  grade: result.grade,
  score: Number(result.score.toFixed(3)),
  pass: result.pass,
  violations: result.violations.map((v) => v.rule)
});
function buildDiagram(input, opts = {}) {
  const { layout = simpleLayout, maxRounds = 4, validateOpts = {} } = opts;
  const pick = pickIdiom(input);
  let contract = pick.contract;
  const sized = withSizes(input.nodes || [], input.edges || []);
  let view = {
    contract,
    nodes: layout(contract, sized, input.edges || []),
    edges: input.edges || [],
    zoom: input.zoom ?? 1,
    palette: input.palette || {}
  };
  let result = validate(view, validateOpts);
  const rounds = [snap(contract, result, "initial")];
  let best = { view, result, contract };
  let round = 0;
  while (!result.pass && round < maxRounds) {
    round++;
    let changed = false;
    const has = (a) => result.corrections.some((c) => c.action === a);
    if (has("clampPalette")) {
      view = { ...view, nodes: clampPalette(view.nodes, view.palette?.maxColors) };
      changed = true;
    }
    if (has("separateOverlaps")) {
      view = { ...view, nodes: separateOverlaps(view.nodes) };
      changed = true;
    }
    if (has("thinLabels")) {
      view = { ...view, nodes: thinLabels(view.nodes) };
      changed = true;
    }
    if (changed) result = validate(view, validateOpts);
    const swap = result.corrections.find((c) => c.action === "suggestIdiom");
    if (!result.pass && swap?.to && swap.to !== contract) {
      contract = swap.to;
      view = { ...view, contract, nodes: layout(contract, withSizes(input.nodes, input.edges), input.edges || []) };
      result = validate(view, validateOpts);
      changed = true;
    }
    rounds.push(snap(contract, result, `round ${round}`));
    if (result.score > best.result.score) best = { view, result, contract };
    if (!changed) break;
  }
  const final = result.pass ? { view, result, contract } : best;
  const notes = [
    ...pick.warnings,
    ...final.result.pass ? [] : ["Could not fully pass \u2014 showing the best-scoring view; some elements reduced for readability."]
  ];
  return { contract: final.contract, view: final.view, score: final.result.score, grade: final.result.grade, passed: final.result.pass, pick, rounds, notes };
}
export {
  DEFAULTS,
  Diagram,
  GroupLayer,
  SequenceDiagram,
  buildDiagram,
  chooseEncoding,
  clampPalette,
  computeMetrics,
  computeShape,
  contrastRatio,
  convexHull,
  Diagram_default as default,
  detectGroups,
  edgeLengthReport,
  ensureContrast,
  graphDistances,
  groupOf,
  hullPath,
  laneBands,
  mdsPositions,
  pickIdiom,
  proximityReport,
  readableOn,
  regionOverlaps,
  separateOverlaps,
  simpleLayout,
  thinLabels,
  validate
};
