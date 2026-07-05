# Handover — ScnTw Design System (diagram/chart policy work)

You are taking over an in-flight project. Read this fully before acting. The
previous assistant worked in a sandbox that **cannot push, cannot run a browser,
and has no `node_modules`** — so verification is done by static compile + a
headless layout probe, and **the user (AD) pushes from their Mac and confirms
visuals by screenshot.** Match that workflow.

## What this is

`ScnTw-Design-system` — a Storybook design system (GitHub `ADeravi/ScnTw-Design-system`,
deployed to GitHub Pages `aderavi.github.io/ScnTw-Design-system`, local repo at
`/Users/ad/Server/CoWork/ScnTw-Design-system`). It is consumed by a separate app,
the "Symantic Relationship Visualiser." Stack: **Storybook 10 (nextjs-vite — no
tsc gate, SWC/esbuild strip types), React 19, Tailwind v4, shadcn/ui, recharts
^3.8.0, cytoscape.js (+cytoscape-elk, +fcose), elkjs (used directly), oklch
3-tier tokens with per-"Design Layer" theming.**

## The core idea: a verifiable policy model

Every visualisation family is a **guardrail**: the caller passes *meaning* (the
question + data), never *form*. Each family has the same shape —
**pure rules → encoder → linter → headless probe → markdown doc** — so "AI
proposes meaning, app disposes form" is *verifiable*, and illegal states are
unrepresentable. The guiding doc is the user's 10-tenet Visualisation Manifesto
(form follows question; distance must be earned; position first; group by region;
dim by default; one accent; declutter; tell the truth; fact ≠ inference; explore
xor explain). IBM **Carbon** is the external reference for primitives & colour.

### Families & key files
- **Charts** — `components/charts/`: `pickChart.ts` (intent+data → chart),
  `chartLint.ts` (`validateChart`), `Chart.tsx` (guardrail on recharts,
  theme-aware palette), `CHART-POLICIES.md`. Stories: `Charts/Guardrail`,
  `Charts/Policies`, `Charts/Overview` (policy-driven gallery).
- **Diagrams** — `components/diagram/`: `Diagram.tsx` (guardrail on cytoscape+ELK),
  `layout.ts` (uniform sizing + `elkOptions`, BRANDES_KOEPF/BALANCED),
  `diagramLint.ts`, `grouping.ts` + `GroupLayer.tsx` (hulls/lanes overlay),
  `mds.ts`, `POLICIES.md`. Stories under `Diagram/*`.
- **Edges** — `edgePolicy.ts` (`planEdges` → fan→FIXED_SIDE port + corner budget;
  `buildElkGraph` ports + optional `partitionOf` for swimlanes; `extractRoutes`),
  `edgeLint.ts` (`lintEdges`), `EdgeLayer.tsx` (SVG overlay drawing ELK's actual
  routed sections), `EDGE-POLICIES.md`. Story `Diagram/Edge Policies`.
- **Foundation (shared tier)** — `components/foundation/`: `primitives.ts`
  (Carbon 2× spacing scale, type ramp, opacity set, `GRAY` ramp + `neutralRoles`,
  `lintPrimitives`), `contrast.ts` (oklch→sRGB + WCAG), `index.ts`,
  `PRIMITIVES-POLICY.md`, `COLOR-BASELINE.md`. **Back-compat shims**
  `components/charts/contrast.ts` and `components/diagram/primitives.ts` just
  re-export from foundation — keep them.

### How diagrams render (important)
Idioms in `ELK_ROUTED` (`flow, tree, state, er, swimlane`) lay out with **elkjs
directly** (`buildElkGraph(planEdges…)`), preset the cytoscape node positions, and
draw **edges + labels in `EdgeLayer`** (an SVG overlay synced to the cytoscape
pan/zoom exactly like `GroupLayer`). cytoscape's own edges are hidden
(`display:none`). So **rendered route == verified policy.** `cluster` and
`similarity` still use cytoscape (fcose / preset-MDS) and its bezier edges.

## VERIFICATION (do this, every change)
1. **Compile-check** (sandbox has no deps): 
   `npx -y esbuild@0.21.5 <files> --bundle --packages=external --format=esm --outdir=/tmp/x --loader:.tsx=tsx --alias:@=.`
2. **Headless policy probe** — the single aggregate gate (primitives on Carbon
   scales + chartLint good/bad + per-idiom diagram geometry + edge routing):
   `npm run lint:policies` (= `tools/diagram-critique/elk-probe.ts` via tsx).
   In the sandbox: `mkdir -p /tmp/dgtest && cd /tmp/dgtest && npm i elkjs@0.9.3`,
   then esbuild the probe `--external:elkjs --platform=node` to `/tmp/dgtest` and
   `node` it. It must print "All layout + edge checks passed."
3. Commit directly to **main** with a conventional-commit message. The user pushes
   from their Mac. After they push, GitHub Pages' CDN caches — tell them to
   hard-refresh / incognito.

## HARD CONSTRAINTS (do not violate)
- **cytoscape canvas can't parse token strings.** Colours handed to cytoscape
  (node fills, edge/label colours) MUST be concrete `rgb()/#hex` — never a raw
  `var(--x)`/oklch/hsl-triplet, or it silently renders **black**. Use the
  contrast helpers / `neutralRoles` / `t.bgSolid` (the browser-resolved
  background from `readTokens`). This caused a multi-day "black label box" bug.
- **Cannot push, cannot open a browser/build Storybook, no node_modules** in the
  sandbox. Chrome MCP and the local-Storybook MCP are both blocked by a
  sandbox-origin rule → you cannot self-verify visuals. Rely on AD's screenshots.
- **Security:** never commit `.mcp.json` (real API key; gitignored; only
  `.mcp.json.example` is public). No licensed/yFiles code in this public repo.
  The GitHub PAT **cannot** modify `.github/workflows/` — write workflow files
  but tell AD to push them. Never "clean" the NUL byte in `src/main.jsx`. Fetch
  web only via `WebSearch`/`web_fetch` (never curl/wget for content). Don't echo
  secrets from `claude_desktop_config.json`.
- All commits go to **main** (no PRs).

## How AD works
Terse, fast, iterative. Strong preference for **concise, direct** answers,
minimal formatting. Verifies by screenshot and gives sharp, often philosophical
design corrections — implement the intent, don't over-explain. Uses IBM Carbon as
the north star. Don't ask permission for obvious next steps; do the verifiable
thing and report briefly.

## Current state (latest commit `2e462e8`)
Recently shipped and **awaiting AD's visual confirmation** (geometry verified
headlessly; colour/lane-bands need eyes):
- ELK-routed `EdgeLayer` for flow/tree/state/er/**swimlane** (swimlane via ELK
  partitioning; manual lane-snap removed). Probe: edges clear of nodes, 0 crossings.
- **Carbon neutral colour baseline** (`GRAY` + `neutralRoles`): light surface
  tiles, dark text, subtle borders (gray-20), light connectors (gray-30),
  polarity-aware, end-of-ramp label chips. `COLOR-BASELINE.md`.
- Floating zoom/fit control (Carbon affordance).

### Open items / next steps
1. **Verify the colour + swimlane change** with AD (push + screenshot flowchart +
   swimlane). Tuning knobs if too subtle: `surface` gray-10→stronger, `border`
   gray-20→gray-30, `line` up a step.
2. **Expand/collapse-all** nodes (the other Carbon diagram affordance) — needs the
   `cytoscape-expand-collapse` dependency (AD must approve adding it).
3. Pixel-parity edge rendering is **done** (EdgeLayer draws ELK routes).
4. Bigger arc AD is interested in: point the **rest of the shadcn components** and
   the **visualiser app** at `components/foundation/`; extend `lint:policies` to
   scan them; and the "BIM/Building-Information-Modeling-for-data" framing
   (ontology/semantic layer) as a future direction.
5. Wire `policy-check.yml` into CI is committed but **must be pushed by AD**.

## First action when you take over
Ask AD whether the last push (the Carbon colour + swimlane change) looks right, or
have them paste a screenshot of the flowchart + swimlane. Fix from real evidence,
not assumptions — the whole project has been bitten by guessing at rendered output
the sandbox can't see.
