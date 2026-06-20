# What we can learn from leading chart / diagram systems

Benchmarking our guardrail policy model against the best in class. The recurring
theme that *validates our direction*: the strong systems all separate **meaning
from form** and let the system do the hard work — exactly our goal ("AI pushes
meaning, the system produces a good visual"). The gaps below are where we can go
further.

## Per system — lesson → how it maps to us

**Vega-Lite / Grammar of Graphics** (the chart gold standard). A *compiler*: the
author declares the field **types** + a mark; it derives axes, legends, scales
and defaults by rule, and any part is overridable. → This is `pickChart` taken
further. Adopt: formalise a small **encoding grammar** (type + intent → mark +
scale + axis + legend defaults, all overridable), and a **legible-label-layout**
pass (Vega-Lite added one).

**Adobe Spectrum — data-viz colour.** Categorical capped < 6 and CVD-optimised;
sequential = perceptually-linear **lightness** ramp; diverging = two ramps with a
neutral midpoint; colours plotted on a uniform colour space (combats Stevens'
power law). → We already cap Okabe-Ito ≤ 6 and use **oklch** (perceptually
uniform). Adopt: generate proper **sequential & diverging ramps in oklch**
(lightness = magnitude; neutral midpoint) so `Chart`/`chartLint` can hand quant
fields the right ramp instead of only flagging the wrong one.

**Microsoft Fluent 2 — tokens.** Two layers: **global** (raw values) → **alias**
(semantic: neutral / brand / status). → Our `neutralRoles` is the start of an
alias layer. Adopt: document a clean **global → alias** split (ramp → surface /
text / border / line / accent / status) that charts, diagrams *and* components
all reference — never raw tokens.

**yFiles** (the diagram-layout gold standard; licensed — study, don't copy).
Node-**label-aware** orthogonal routing (edges avoid *labels*, not just boxes);
strong vs weak **port constraints** + port candidates; **integrated label
placement that prevents overlaps completely**, with preferred side + distance. →
Our biggest gap. Adopt: **label-overlap avoidance** — a label must not sit on a
node or another label (this is the ER "published in" over *Venue* defect); and
make routing label-aware. Optionally add exact-anchor ports beyond `FIXED_SIDE`.

**Microsoft MSAGL** (open source, MIT — a real reference). Sugiyama layered +
multiple routing modes: rectilinear, spline, **spline-bundling**. → Adopt **edge
bundling / curving for high-degree hubs** to cut clutter (our 6-entity hub ER and
dense graphs would benefit). MIT, so we can read the implementation.

**D2 / TALA.** **Containers (nesting) are a first-class layout concern at every
stage**, orthogonal pathing, 30+ one-switch themes. → Our groups are an *overlay*
(hulls), not a layout constraint. Adopt: real **compound-node (container) layout**
via ELK so groups are laid out *as* containers (robust nesting), not painted
after.

**Mermaid.** Massive reach, text→diagram, themes — but it openly admits the SVG
content is **inaccessible** to screen readers (only `aria-roledescription` +
title/desc). → We're **ahead**: every view carries an **alt-data-table**. Adopt
the cheap extra: add `aria-roledescription` + accessible title/desc to our SVG.

**Miro / FigJam.** Smart connectors that **auto-route, snap, re-align**; AI
auto-organises/clusters; connector labels on the path; solid/dashed; just two
stroke weights. → Validates our restraint (orthogonal auto-routing, dashed
semantics, a small STROKE scale, labels on the path) and the "AI organises"
premise. Little to add beyond the affordances already noted (zoom tile done;
expand/collapse pending).

## What to adopt, prioritised

1. **Label-overlap avoidance** (yFiles) — labels never overlap a node or another
   label; routing is label-aware. *Highest value, fixes a visible defect.* Add a
   placement pass in `EdgeLayer` + `route.labelOverlap` checks in `edgeLint`/probe.
2. **Perceptually-uniform sequential + diverging palettes** in oklch (Spectrum) —
   wire into `Chart`/`chartLint` for quantitative colour.
3. **Container layout for groups** (D2/ELK compound nodes) — replace hull-overlay
   grouping with real nested layout where membership is structural.
4. **Edge bundling for hubs** (MSAGL) — clutter reduction on high-degree nodes.
5. **Global→alias token layer** (Fluent) + **encoding-grammar depth** (Vega-Lite)
   + **SVG aria** (Mermaid) — formalisation & a11y polish.

## Where we already match or lead
elkjs-based layout (Carbon's own recommendation); declarative meaning→form
(Vega-Lite); orthogonal routing + port sides + corner budgets + verified routes
(yFiles/MSAGL/ELK); capped CVD-safe categorical palette (Spectrum/Carbon); the
**alt-data-table beats Mermaid's a11y**; and a **headless policy probe** as a CI
gate — which none of the above ship as a built-in correctness check.

---

### Sources
- Vega-Lite — [grammar of interactive graphics](https://vega.github.io/vega-lite/), [paper](https://idl.cs.washington.edu/files/2017-VegaLite-InfoVis.pdf); [legible label layout](https://arxiv.org/pdf/2405.10953).
- Adobe Spectrum — [colour for data visualization](https://spectrum.adobe.com/page/color-for-data-visualization/).
- Microsoft Fluent 2 — [design tokens](https://fluent2.microsoft.design/design-tokens).
- yFiles — [orthogonal routing](https://docs.yworks.com/yfiles-html/dguide/layout/orthogonal_layout.html), [port placement](https://docs.yworks.com/yfiles-html/dguide/layout/port_placement.html).
- Microsoft MSAGL — [repo](https://github.com/microsoft/automatic-graph-layout), [research](https://www.microsoft.com/en-us/research/project/microsoft-automatic-graph-layout/).
- D2 / TALA — [TALA](https://terrastruct.com/tala/), [D2](https://github.com/terrastruct/d2).
- Mermaid — [accessibility](https://mermaid.js.org/config/accessibility.html).
- Miro — [auto-layout](https://community.miro.com/product-news-31/auto-layout-and-other-ux-improvements-1225); FigJam — [connectors](https://help.figma.com/hc/en-us/articles/1500004414542-Create-diagrams-and-flows-with-connectors-in-FigJam).
- IBM Carbon — [flow charts](https://carbondesignsystem.com/data-visualization/flow-charts/) (defers layout to elkjs).
