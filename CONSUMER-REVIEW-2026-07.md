# ScnTw — consumer review, July 2026

**Reported by:** the Symantic Relationship Visualiser (`/Users/ad/Server/MCP Servers/Symantic Visualiser`),
the first production consumer of `scntw-ds` outside Storybook. It imports
`scntw-ds/diagram/components` (`Diagram`, `SequenceDiagram`) and renders AI-authored
canvases through them.

**Reviewed against:** `572a87d` ("F3: generate profile-deltas.json from TokenOS + gate it").

**How these were found:** building the Visualiser's Diagram tab on the real engine, then
reading the source to explain behaviour the user reported. Every claim below was verified
against the file at the line cited — several were re-checked and one earlier claim was
withdrawn (see *Withdrawn* at the end). Line numbers are from `572a87d` and will drift.

**What this is not:** a style review. Every item is either a visible defect, a rule the
system states and then breaks, or a boundary that forces consumers to duplicate internals.
The design system is good; these are the seams that showed under load.

---

## A. `resolvedBg` is alpha-blind, which inverts the light/dark polarity

**Severity: high — visible breakage.** Nodes render as near-black boxes on a white canvas.

**Currently dormant, not fixed.** The Visualiser removed the rose wash that triggered it
for unrelated reasons. Any consumer putting a translucent background behind a `Diagram`
will hit it again.

`resolvedBg` (`components/charts/network.tsx:104-112`) promises, in its own docstring, "the
first **concrete, opaque** computed background-color". It never tests alpha:

```ts
const bg = getComputedStyle(node).backgroundColor;
if (bg && bg !== "transparent" && !/^rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)) return bg;
```

That regex rejects exactly one value: fully-transparent black. A 6%-alpha wash passes as
opaque. It then flows into `bgSolid` (`network.tsx:157`) and from there to
`Diagram.tsx:289`:

```ts
const edgeColor = neutralRoles(readableOn(t.bgSolid, ["#000000", "#ffffff"]) === "#000000").line;
```

`readableOn` → `toRGB` → `oklchToRgb`, whose regex captures **only L, C and H**
(`foundation/contrast.ts:7`) — the `/ 0.06` is silently dropped. So a wash the eye sees as
near-white is measured as the solid rose underneath it. Traced end to end:

```
resolvedBg returns   : oklch(0.514 0.222 16.935 / 0.06)
oklchToRgb ignores α : rgb(199, 0, 54)          ← the SOLID rose
what the eye sees    : ~rgb(252, 247, 248)      ← 6% rose over white
readableOn(bgSolid, ["#000000","#ffffff"]) = "#ffffff"
Diagram.tsx:289  light = (that === "#000000") = false
→ neutralRoles(false) = the DARK palette → GRAY[90] fills on a white canvas
```

The colour maths is fine. `oklchToRgb` is correct, `toRGB` handles oklch, `contrastRatio` is
proper WCAG. The failure is one unchecked assumption at the boundary: a translucent colour
is treated as an opaque one, and every correct function downstream then computes the right
answer to the wrong question.

**Proposed fix.** Either composite the alpha over the parent chain (correct, more work), or
skip non-opaque backgrounds and keep walking (cheap, matches the existing docstring). Parse
alpha from `rgba(…)`, `oklch(… / α)` and `hsl(… / α)`; treat `α < 0.99` as not-yet-concrete.
The existing `isDarkColor(fg)` fallback at `network.tsx:157` already handles "nothing found",
so the cheap fix has a landing place. Worth extending `oklchToRgb` to return the alpha
regardless, since dropping it silently is what made this invisible.

**Verify:** render a `Diagram` inside a container with `background: oklch(0.514 0.222 16.935 / 0.06)`
on a light theme. Nodes should stay light.

---

## B. `autoungrabify: false` contradicts static ELK routes — edges detach when nodes are dragged

**Status: FIXED IN SOURCE — `Diagram.tsx:459` now reads `autoungrabify: elkRouted`.**
Pending a `npm run build` + publish so the dist carries it (the consumer's installed
`dist/diagram/index.js` was hand-patched identically as a stopgap until then). The note
below is kept for the reviewer's context.

**Severity: high — visible breakage.** User-reported: "Edges are not connected to each node.
So when nodes are moved the edges disconnect."

For `ELK_ROUTED` kinds — `flow`, `tree`, `state`, `er` (`Diagram.tsx:36`) — cytoscape's own
edges are hidden (`Diagram.tsx:332`, `display: "none"`) and `EdgeLayer` paints the
precomputed orthogonal routes instead. But nodes stay grabbable (`Diagram.tsx:459`):

```ts
autoungrabify: false,
```

`EdgeLayer` re-syncs on `cy.on("render pan zoom resize", schedule)` (`EdgeLayer.tsx:52`), so
a drag *does* trigger a redraw — of the **same** `routes` array, which ELK computed for the
node's old position. The node moves, the route doesn't. The redraw is what makes it look
deliberate rather than stale.

Both halves are individually reasonable; together they're contradictory. A layout whose
edges are computed by an offline router cannot also let the user move the endpoints, unless
dragging re-runs the router (expensive, and it would fight ELK's layering).

**Proposed fix.** `autoungrabify: ELK_ROUTED.has(resolvedKind)` — one line, and it makes the
constraint honest: in a routed idiom, position is the router's to decide. If dragging is
wanted later, it needs a re-route on `dragfree`, which is a much larger change and probably
the wrong affordance for a flowchart.

---

## C. `react` / `react-dom` are dependencies, not peerDependencies

**Severity: high — blank page.** Cost the Visualiser a debugging session:
`Cannot read properties of null (reading 'useMemo')`.

```json
"dependencies": { "react": "19.2.4", "react-dom": "19.2.4", … }
"peerDependencies": undefined
```

npm nests `scntw-ds/node_modules/react@19.2.4` beside the app's `react@19.2.6`. Two React
copies, two dispatchers; any ScnTw component using hooks renders against the wrong one and
nulls out. The consumer worked around it with `resolve.dedupe: ["react", "react-dom"]` in
`vite.config.js`, but that's every consumer paying for a packaging decision, and it fails
differently under webpack/pnpm.

**Proposed fix.** Move both to `peerDependencies` (`>=19`) and `devDependencies`. This is
the standard contract for a component library; the current setup is only invisible inside
this repo's own Storybook, where there's one React by construction.

---

## D. `kind="no"` dashes, which steals the channel Tenet 8/9 has already spent

**Severity: medium — the visual language contradicts itself.** Four lines apart, in one
stylesheet (`Diagram.tsx:371-377`):

```ts
{ selector: 'edge[kind = "no"]', style: { "line-style": "dashed", "line-color": t.mutedF } },
{ selector: 'edge[kind = "async"], edge[kind = "return"]', style: { "line-style": "dashed" } },
// Tenet 8/9 — uncertain / inferred connections render dashed + faint.
{ selector: 'edge[unknown = "1"]', style: { "line-style": "dashed", opacity: OPACITY.inferred } },
// Tenet 9 — AI-inferred connections in the --rose provenance accent
{ selector: 'edge[inferred = "1"]', style: { "line-style": "dashed", "line-color": t.rose, … } },
```

The comment claims dash for provenance; the selector above it hands dash to a no-branch. A
dashed grey line therefore means both *"this is the no branch"* and *"this is unverified"*.
`inferred` escapes via colour (rose), but `unknown="1"` is dashed **and grey** — genuinely
indistinguishable from a no-branch. And an inferred no-branch has no way to say both things
at once.

The deeper point, raised by the Visualiser's author: a branch is an **answer**, and an
answer is carried by its word, not by a line style. `yes`/`no` were never line styles in the
first place. Dropping the `no` dash costs nothing (branches are labelled — see E) and gives
Tenet 8/9 back an exclusive channel.

**Proposed fix.** Delete the `edge[kind = "no"]` selector. Keep `async`/`return` — those are
UML sequence convention and don't co-occur with flowchart branches, though they still
collide with `unknown` inside a sequence diagram and are worth a second look.

**Consumer workaround in place:** the Visualiser maps every decision branch to `kind: "flow"`
plus a label, specifically to dodge this. Remove that when fixed —
`src/shell/CanvasZone.jsx`, `ScnDiagramView`.

---

## E. `EdgeKind` conflates connector types with branch answers

**Severity: medium — API design.** `types.ts`:

```ts
type EdgeKind = "flow" | "yes" | "no" | "transition" | "relation" | "message" | "return" | "async";
```

`flow`/`relation`/`transition`/`message` are **kinds of connector**. `yes`/`no` are
**answers to a decision**. They're different categories in one enum, and the enum is
incomplete on the answer side: `accept`, `reject`, `revise` are equally valid answers and
aren't there.

That incompleteness isn't cosmetic — it forces consumers into a wrong branch. The obvious
mapping is *"is this word in `EdgeKind`? then it's a kind, else it's a label"*, which routes
`yes`/`no` to `kind` (unlabelled) and `accept`/`reject` to `label` (labelled). Same
construct, two renderings, decided by which words the enum happens to list. The Visualiser
shipped exactly this bug and its yes/no branches drew blank for weeks.

**Proposed fix.** Drop `yes`/`no` from `EdgeKind`; branches are `flow` + a label. If the
router needs to know a branch is a branch, it already does — `edgePolicy.ts:63-65` derives
it from the *source node's role*, which is the right source of truth and works for `accept`
just as well as for `yes`.

---

## F. `edgeLint` never requires a branch to have a label

**Severity: medium — a lint gap that hides real errors.** `edgePolicy` knows precisely which
edges are branches (`edgePolicy.ts:13-14, 63-65`):

```
//   · decision primary        out the BOTTOM (straight pass-through)       ≤1
//   · decision secondary      out the near SIDE                            ≤2
if (role === "decision" && n >= 2) {
  if (pos === 0) { sourceSide = OUT; fan = "branchPrimary"; budget = 1; }
  else { sourceSide = pos % 2 ? SIDE_B : SIDE_A; fan = "branchSecondary"; budget = 2; }
}
```

It routes them deliberately and gives each a corner budget. But `edgeLint`'s rules are
`route.cornersOverBudget`, `route.crossesNode`, `route.manyCrossings` and
`label.overlapsNode` (`edgeLint.ts:91-122`) — the only label rule is about where a label
*sits*, not whether it exists. An unlabelled `yes`/`no` branch grades **A**.

That's the highest-value gap in the list, because it's the one that would have caught E
automatically. An unlabelled branch is a genuine comprehension failure — a reader cannot
tell which line is "yes" — and `lintEdges` already receives `plans` (with `fan`) and
`labels` in the same call. The rule is nearly free:

```ts
// in lintEdges, per plan
if ((p.fan === "branchPrimary" || p.fan === "branchSecondary") && !labels[r.index]?.trim())
  v.push({ rule: "branch.unlabelled", severity: "error",
           detail: `${p.source}→${p.target} leaves a decision with no label — the reader cannot tell which branch this is.` });
```

`severity: "error"` is the right call: a flowchart with unlabelled branches is not a
flowchart, it's a maze.

---

## G. `Diagram` ships as a Storybook card, so it can't be embedded

**Severity: medium — forces `!important` in consumers.** `Diagram.tsx:598`:

```tsx
<figure style={{ margin: 0, position: "relative", width: 720, maxWidth: "100%" }}>
```

Plus its own border, background and a `<figcaption>` (`:636`). Hard-coded `720px` and card
chrome are right for a Storybook demo and wrong for anything that wants a diagram to fill a
canvas. There's no `bare` / `fill` prop and the styles are inline, so they can't be
overridden by specificity — only by `!important`.

The Visualiser currently does this, which is exactly the kind of thing a design system
exists to prevent:

```css
.shell .graph-host > figure { width: 100% !important; max-width: none !important; … }
.shell .graph-host > figure > div { height: auto !important; border: 0 !important; background: transparent !important; }
```

**Proposed fix.** A `bare?: boolean` (or `fill`) prop that drops the figure chrome and lets
width/height come from the parent. The component keeps its opinionated default; embedding
stops being a fight.

---

## H. The role→shape / role→accent vocabulary isn't exported, so consumers mirror it

**Severity: low — but it guarantees silent drift.** `diagram/index.ts` exports `Diagram`,
`SequenceDiagram`, `GroupLayer`, `mdsPositions`, `graphDistances` and the `grouping` family.
It does **not** export `roleStyle` (`Diagram.tsx:96`) or `shapeFor` (`:67-79`). `NodeRole`
and `EdgeKind` are types — erased at runtime, so a consumer can't even test membership.

Anything that has to *describe* the diagram — a legend, a key, a docs page — must
re-implement the mapping. The Visualiser now carries this, copied by hand with source-line
comments as the only defence:

```js
const ROLE_ACCENT = { decision: "var(--chart-3)", entity: "var(--chart-2)", io: "var(--chart-4)" };
const ROLE_SHAPE  = { start: "pill", end: "pill", decision: "diamond", io: "rhomboid", entity: "rect" };
```

The day someone changes `roleStyle`, the Visualiser's legend starts lying and nothing fails.
A legend that disagrees with the picture is worse than no legend.

**Proposed fix.** Export the runtime vocabulary — `NODE_ROLES` / `EDGE_KINDS` as `Set`s, and
either `roleStyle` itself or a small `describeRole(role) → { shape, accent }`. Legends are a
first-class consumer of a diagram engine; right now the API assumes only the renderer needs
to know how things look.

---

## Withdrawn

**"`resolvedBg` can't parse `oklch` / `color(display-p3 …)`."** Wrong on both counts, and I'd
asserted it more than once before checking. `oklchToRgb` exists and is correct
(`foundation/contrast.ts:6`), `toRGB` routes oklch through it, and **no token in this repo
uses `display-p3`** — I invented that detail. The real mechanism is alpha-blindness (A). The
symptom I'd attached to it (black boxes) was real; the explanation was not.

---

## Suggested order

C and B first — both are one-liners with immediate, visible payoff (blank page; detached
edges). Then A, which needs a little care around compositing. D and E are one change viewed
from two angles: delete the `no` dash, drop `yes`/`no` from the enum, and branches become
"flow + label" throughout — do them together. F pairs naturally with E, since the lint rule
is what stops E regressing. G and H are boundary work, worth doing before the next consumer
arrives and copies the workarounds.

## Consumer-side workarounds to retire

When these land, delete the corresponding hacks in the Visualiser: `resolve.dedupe` in
`vite.config.js` (C), the `!important` block in `src/shell/shell.css` (G), the branch→`flow`
remap in `src/shell/CanvasZone.jsx` (D/E), and the mirrored `ROLE_ACCENT`/`ROLE_SHAPE`/
`DASHED_EDGE` maps in `src/shell/LegendPanels.jsx` (H).
