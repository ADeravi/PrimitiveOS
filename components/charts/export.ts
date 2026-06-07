"use client";

/**
 * Chart export utilities: SVG, PNG and CSV downloads.
 *
 * SVG/PNG exports inline the *computed* fill/stroke/font of every element so
 * that token-based colours (oklch CSS variables) survive outside the page.
 */

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STYLE_PROPS = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "opacity",
  "font-size",
  "font-family",
  "font-weight",
  "text-anchor",
] as const;

/** Clone the SVG with computed styles inlined, so CSS variables resolve. */
function inlineSvg(svg: SVGSVGElement): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const src = svg.querySelectorAll<SVGElement>("*");
  const dst = clone.querySelectorAll<SVGElement>("*");
  src.forEach((el, i) => {
    const cs = getComputedStyle(el);
    for (const p of STYLE_PROPS) {
      const v = cs.getPropertyValue(p);
      if (v) dst[i].style.setProperty(p, v);
    }
  });
  const rect = svg.getBoundingClientRect();
  clone.setAttribute("width", String(Math.round(rect.width)));
  clone.setAttribute("height", String(Math.round(rect.height)));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  // Solid background so PNG/SVG don't end up transparent-on-dark.
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", getComputedStyle(svg).getPropertyValue("background-color") || "white");
  const pageBg = getComputedStyle(document.body).backgroundColor;
  bg.setAttribute("fill", pageBg && pageBg !== "rgba(0, 0, 0, 0)" ? pageBg : "white");
  clone.insertBefore(bg, clone.firstChild);
  return clone;
}

export function exportSvg(svg: SVGSVGElement, filename = "chart.svg") {
  const xml = new XMLSerializer().serializeToString(inlineSvg(svg));
  download(new Blob([xml], { type: "image/svg+xml" }), filename);
}

export function exportPng(svg: SVGSVGElement, filename = "chart.png", scale = 2) {
  const xml = new XMLSerializer().serializeToString(inlineSvg(svg));
  const rect = svg.getBoundingClientRect();
  const img = new Image();
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
    canvas.toBlob((blob) => {
      if (blob) download(blob, filename);
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.src = url;
}

export function exportCsv(rows: Record<string, unknown>[], filename = "chart.csv") {
  if (!rows.length) return;
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  download(new Blob([csv], { type: "text/csv" }), filename);
}
