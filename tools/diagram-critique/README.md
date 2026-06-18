# Screenshot-and-critique loop (prototype)

A perceptual quality gate for diagrams. The deterministic linter
(`components/diagram/diagramLint.ts`) scores the **data model** — coordinates,
overlaps, groups. This loop scores the **rendered pixels** the way a reader sees
them: clipped labels, hairball routing, accidental grouping, poor balance — the
failures that only exist once the thing is drawn.

```
render a real Storybook story  →  screenshot the settled diagram
        →  vision model grades it against rubric.json
        →  map findings to corrective actions  →  re-render
```

It points Playwright at the **actual Storybook story** (`iframe.html?id=…`), so
it grades the real component — no re-implementation, no drift. The component
sets `data-diagram-ready="1"` once layout settles, which is the capture signal.

## Run

```bash
npm i -D playwright && npx playwright install chromium

# one pass (screenshot always; auto-grade if ANTHROPIC_API_KEY is set)
node tools/diagram-critique/critique.mjs --story diagram-overview--flowchart

# against a local Storybook instead of the deployed site
node tools/diagram-critique/critique.mjs --story diagram-overview--swimlane --base http://localhost:6006

# the closed loop (tunes Storybook args between rounds, logs the trajectory)
ANTHROPIC_API_KEY=… node tools/diagram-critique/loop.mjs --story diagram-grouping-proximity--communities --rounds 3
```

Output lands in `tools/diagram-critique/out/<story>.png` and `<story>.json`.
Without an API key it stops after the screenshot — hand the PNG to a human or an
agent to grade.

## Why this complements, not replaces, the linter

| | deterministic linter | screenshot-and-critique |
|---|---|---|
| sees | node coords, groups, edges | the rendered image |
| catches | overlap, palette, proximity ratio | clipped text, visual clutter, "can I trace it?" |
| cost | instant, free, in-loop | a render + a model call |
| role | the fast guardrail on every build | the perceptual audit / calibration |

Together they close the gap: the linter guarantees the *model* is sound; this
checks the *drawing* actually reads. Findings share one action vocabulary
(`rubric.json`), so a critique result can feed the same auto-correct loop.

## Limits (it's a prototype)

- Arg-level auto-correction only nudges what a Storybook arg can change (e.g.
  canvas height). Deeper fixes (reroute, swap idiom, enclose groups) are logged
  as recommendations for the pipeline rather than applied automatically.
- The rubric is a starting point; calibrate weights/thresholds against a corpus
  of human-rated diagrams before trusting the scores.

## Headless layout probe (no browser)

`elk-probe.ts` is the fast, deterministic complement to the screenshot loop. It
runs the **real ELK engine** over canonical fixtures (flow, tree, state, ER)
using the exact pure module the component imports — `components/diagram/layout.ts`
(`uniformSizes`, `elkOptions`) — and asserts the fundamentals the eye reads
first:

- **uniform box width** — every rectangular role shares one column width
- **straight spine** — the trunk nodes are collinear on the cross-axis
- **symmetric branches** — a decision's children fan equally about it

Because the probe and the component share `layout.ts`, they can't drift: the
sizes verified here are the sizes rendered. It needs no browser, so it's a cheap
CI gate and the first check to run after touching layout.

```
npm run probe:diagram     # → ✓/✗ per check, non-zero exit on failure
```

Use it for geometry (sizing, alignment, balance); use the screenshot loop above
for the things only pixels reveal (label legibility, routing noise, colour).
