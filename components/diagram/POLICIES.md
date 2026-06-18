# Diagram Policies — anchored to the Visualisation Manifesto

The source of truth for these policies is **your Visualisation Manifesto**
(`MANIFESTO.md` in the Symantic Relationship Visualiser) and its supporting
`DATAVIZ-PRINCIPLES.md` / `MODEL-SPECS.md`. ScnTw is the design system that app
consumes, so the Diagram guardrails here are a faithful **extension** of that
contract, not a parallel invention. Each policy below cites the tenet it serves
and the book evidence behind it.

The architecture is the same on both sides: **AI proposes meaning (what), the
application disposes form (how)**, through one pipeline — *schema gate →
principled defaults → validate() linter* — enforced application-side so anything
the AI sends inherits it.

## The 10 tenets (canonical)

1. **Form follows the question** — every canvas/diagram needs an intent.
2. **Distance must be earned** — only MDS/stress/embedding make distance real.
3. **Position first** — axis for the key quantity; colour = category, size = coarse.
4. **Group by region, not by hope** — containment/hull, never force-clustering.
5. **Dim by default, reveal on hover.**
6. **One accent, consistent colour across views.**
7. **Declutter to the data.**
8. **Tell the truth** — mark unknown/undated; honest scales; never silently drop.
9. **Fact is not inference** — `origin:ai` edges dashed + evidence.
10. **Explore or explain, never both** — the two-path split.

---

## Policy 1 — Enclosure is a membership claim  ·  Tenets 4, 2

**Principle.** Grouping is guaranteed only by **common region** (hull /
containment), never by hoping a force layout clusters — "we will find structure
in random data," so accidental proximity reads as a finding. Gestalt strength
ordering: colour < connection (edge) < **enclosure** (hull); "light background
shading is often enough" (Knaflic p.77; Berengueres; Healy p.22). And on a force
layout **distance is not meaningful** — the UI must never imply it (Tenet 2).

**Enforced.** Hull contains every member and never overlaps another group; groups
placed as disjoint units, free placement within. Force/cluster idioms *offer
hulls by construction* because positions are accidents. Linter:
`proximity.accidentalAdjacency` (error), `proximity.weakSeparation`, hull
containment + overlap.

## Policy 2 — Colour means relationship, sparing + legible  ·  Tenets 6, 3

**Principle.** One accent; consistent group colours across views; colour is a
*secondary* group cue after position and region. Use it sparingly and
intentionally — "too much variety prevents anything from standing out"; cap at
**≤6** colour-blind-safe hues (Okabe-Ito); grey base + one accent; intensity (a
heatmap) for magnitude (Knaflic p.133–134; Healy 17–18, 202–205; Berengueres).

**Enforced.** Adaptive: *minimal* when simple (neutral + one accent), *rich* when
complex (role + group + importance). A group's hue is shared across enclosure,
label and a member cue, contrast-checked (never hue-on-hue). Palette capped so it
never recycles. Position carries the key structure; colour only categorises.

## Policy 3 — Edge clarity comes from arrangement  ·  Tenets 7, 5

**Principle.** Clutter is cognitive load — remove anything not earning its place;
"leverage alignment of elements and maintain white space" (Knaflic Ch.3, p.98).
A long, many-cornered edge is a symptom of placement, not a styling problem.
Dim by default and reveal on hover so density never becomes a hairball (Tenet 5;
Kirk's node-link guidance — filter, hover-to-label).

**Enforced.** Minimise edge length, bends, crossings by node arrangement (related
nodes adjacent); align elements, keep consistent margins/radius/whitespace;
reserve dashed lines for genuine uncertainty / `origin:ai` (Tenet 9). Measure
length/bends/crossings and re-arrange — never restyle.

---

## Coverage — what the DS Diagram enforces vs. the Manifesto

| Tenet | In the DS Diagram today |
|---|---|
| 1 Form follows the question | ✅ `intent`/`kind` required; idiom picked from it |
| 2 Distance must be earned | ✅ distance-true `similarity` idiom (MDS + stress score); force/cluster carries a "distance is exploratory" guard note |
| 3 Position first | ✅ structured idioms; colour is category only |
| 4 Group by region | ✅ hulls + lane bands + proximity linter + **region-overlap check** |
| 5 Dim by default, reveal on hover | ✅ cluster dims edges by default, reveals neighbourhood on hover; structured keeps click-to-isolate |
| 6 One accent / consistent colour | ✅ adaptive minimal/rich, capped palette, **contrast-gated text** |
| 7 Declutter to the data | ✅ label thinning, clearance, **long-edge metric** (re-arrange, don't restyle) |
| 8 Tell the truth (mark unknown) | ❌ not yet — no undated/unknown marking in Diagram |
| 9 Fact is not inference | ✅ dashed reserved for uncertainty/return |
| 10 Explore or explain | n/a at component level (app-level split) |

**Open gaps to close next:** honest "unknown/undated" marking (Tenet 8) — mark
nodes/edges of unknown provenance or missing dates rather than silently dropping;
and a registry-style linter rule that *blocks* a similarity intent forced onto a
non-distance-true layout (the idiom now exists; the hard block doesn't).

---

## Carbon Design System alignment (charts + colour)

IBM's Carbon data-visualisation spec is the external check on these policies. It
mostly **reinforces** the manifesto — descriptive *insight* titles (Carbon's
chart title = Knaflic's takeaway = Tenet 1), a legend that defines the
colour/shape/size → data mapping (our group labels), white/dark-only chart
backgrounds for maximum contrast — and it adds concrete rules we adopt:

- **Quantitative/ordered data uses sequential or diverging palettes, not
  categorical.** Sequential = one hue light→dark where *luminance encodes
  magnitude* (matches Knaflic's saturation-as-value); diverging = two hues around
  a meaningful midpoint (Carbon's red↔cyan = temperature, purple↔teal = neutral).
  Categorical colour is only for unordered categories. **Never a gradient for
  meaning.** → so the diagram's *importance* cue should move to border-weight or a
  sequential ramp, never a categorical hue.
- **Categorical palette is an ordered sequence tuned for neighbour contrast,**
  with fixed-N override palettes when the category count is known — reinforces our
  capped, colour-blind-safe group palette.
- **Non-text contrast ≥ 3:1** for any *meaningful* graphic (a role/group-coloured
  border, a line), per WCAG SC 1.4.11 — alongside text ≥ 4.5:1. *Enforced:* rich-
  policy role/group borders are now gated to 3:1 via `ensureContrast` (neutral
  structural outlines stay subtle).
- **Provide an alternative data-table view** of every visualisation
  (accessibility) — a future Diagram addition: "show as table" of nodes/edges.
- **Status/alert semantics:** red = danger, orange = serious warning, yellow =
  warning, green = success — reserve these hues for status only.

---

### Sources
- **Visualisation Manifesto** (`MANIFESTO.md`) — the 10 tenets; render pipeline (schema gate → principled defaults → linter); 8 positional contracts (`SYSTEM-ARCHITECTURE.md` L4) + per-contract `MODEL-SPECS.md`.
- **Carbon Design System** — Data visualisation: [colour palettes](https://carbondesignsystem.com/data-visualization/color-palettes/) (categorical / sequential / diverging / gradients), [chart anatomy](https://carbondesignsystem.com/data-visualization/chart-anatomy/), and accessibility (WCAG 2.1, SC 1.4.11 non-text 3:1, alt data table).
- Knaflic, *Storytelling with Data* (Gestalt p.75–80, colour p.133–134, clutter/alignment Ch.3 p.98).
- Healy, *Data Visualization* (encoding effectiveness p.27; perceptually-uniform palettes 17–18, 202–205; "structure in random data" p.22).
- Kirk, *Data Visualisation: A Handbook* (Ch.6 encoding, Ch.9 colour, Ch.10 composition; node-link reading p.220).
- Berengueres (enclosure/proximity); Gang Su, *Instant Cytoscape* (clustering, filtering, hairball fixes).
