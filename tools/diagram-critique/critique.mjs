#!/usr/bin/env node
// critique.mjs — one pass of the screenshot-and-critique loop.
//
// Renders a REAL Storybook story (no re-implementation, no drift), screenshots
// the settled diagram, and asks a vision model to grade the *pixels* against
// rubric.json. The deterministic linter checks the data model; this checks what
// the reader actually sees — clipped labels, hairball routing, accidental
// grouping — the things only visible once it's drawn.
//
// Usage:
//   node tools/diagram-critique/critique.mjs --story diagram-overview--flowchart
//   node tools/diagram-critique/critique.mjs --story diagram-overview--flowchart \
//        --base http://localhost:6006 --args "height:600" --model claude-sonnet-4-6
//
// Screenshot always works (Playwright). Auto-critique needs ANTHROPIC_API_KEY;
// without it the PNG is saved for a human (or an agent) to judge.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

function arg(name, def) {
  const i = process.argv.indexOf("--" + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const STORY = arg("story", "diagram-overview--flowchart");
const BASE = arg("base", "https://aderavi.github.io/ScnTw-Design-system");
const ARGS = arg("args", "");
const MODEL = arg("model", "claude-sonnet-4-6");
const OUT = arg("out", join(HERE, "out"));

async function screenshot() {
  let chromium;
  try { ({ chromium } = await import("playwright")); }
  catch { throw new Error("Playwright not installed. Run:  npx playwright install chromium  (and `npm i -D playwright`)"); }

  const url = `${BASE}/iframe.html?id=${encodeURIComponent(STORY)}&viewMode=story` + (ARGS ? `&args=${encodeURIComponent(ARGS)}` : "");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  // wait for our settled-layout signal; fall back to a fixed settle.
  await page.waitForSelector('[data-diagram-ready="1"]', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
  const target = page.locator("figure, #storybook-root").first();
  await mkdir(OUT, { recursive: true });
  const png = join(OUT, `${STORY}.png`);
  await target.screenshot({ path: png });
  await browser.close();
  return png;
}

async function critique(pngPath) {
  const key = process.env.ANTHROPIC_API_KEY;
  const rubric = JSON.parse(await readFile(join(HERE, "rubric.json"), "utf8"));
  if (!key) {
    return { skipped: true, reason: "No ANTHROPIC_API_KEY — screenshot saved; hand it to a human/agent or set the key to auto-grade.", rubric: rubric.criteria.map((c) => c.id) };
  }
  const b64 = (await readFile(pngPath)).toString("base64");
  const prompt =
    `You are a strict diagram-readability reviewer. Grade ONLY what is visible in the image.\n\n` +
    `Rubric (score each 0..1, 1 = perfect):\n` +
    rubric.criteria.map((c) => `- ${c.id} (weight ${c.weight}): ${c.question} [fix action: ${c.action}]`).join("\n") +
    `\n\nReturn STRICT JSON, no prose, shape:\n` +
    `{"criteria":[{"id":"overlap","score":0.0,"severity":"ok|warn|error","finding":"...","action":"separateOverlaps"}],` +
    `"overall":{"score":0.0,"grade":"A|B|C|D|F","pass":true,"topFixes":["..."]}}`;

  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL, max_tokens: 1200,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: b64 } },
          { type: "text", text: prompt },
        ] }],
      }),
    });
  } catch (e) {
    return { skipped: true, reason: `Network error reaching the API (${e.message}). Screenshot saved — grade it manually or fix connectivity.` };
  }
  if (!res.ok) {
    const hint = res.status === 401 ? " — ANTHROPIC_API_KEY is invalid; use a key from console.anthropic.com (not your Claude.ai login)." : "";
    return { skipped: true, reason: `Anthropic API ${res.status}${hint} Screenshot saved.` };
  }
  const data = await res.json();
  const text = (data.content || []).map((c) => c.text || "").join("");
  const jsonStr = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(jsonStr); }
  catch { return { raw: text, parseError: true }; }
}

const png = await screenshot();
console.log("📸 screenshot:", png);
const report = await critique(png);
const outJson = join(OUT, `${STORY}.json`);
await writeFile(outJson, JSON.stringify(report, null, 2));
console.log("📝 critique:", outJson);
if (report.overall) console.log(`→ ${report.overall.grade} (${report.overall.score}) ${report.overall.pass ? "PASS" : "needs work"} · fixes: ${(report.overall.topFixes || []).join("; ")}`);
else if (report.skipped) console.log("→", report.reason);
