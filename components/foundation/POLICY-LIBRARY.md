# Policy Library — every rule in one place, + the overlap map

One catalogue of every policy the system enforces, across the chart, diagram,
edge and foundation layers, anchored to the 10-tenet Visualisation Manifesto.
The second half is the point of this doc: **the recurring patterns** — rules that
show up in more than one family — so we can see what's already shared, what's
duplicated, and what to consolidate into `components/foundation/`.

Two kinds of policy: **choosers/encoders** (turn meaning → form: `pickChart`,
`idiomPicker`, `planEdges`, `layout`) and **gates/linters** (refuse a bad result:
`chartLint`, `diagramLint`, `edgeLint`, `lintPrimitives`, `contrast`).

---

## The spine — Manifesto (10 tenets)
1 Form follows the question · 2 Distance must be earned · 3 Position first ·
4 Group by region · 5 Dim by default · 6 One accent / consistent colour ·
7 Declutter to the data · 8 Tell the truth · 9 Fact ≠ inference · 10 Explore xor explain.

## Foundation (shared) — `primitives.ts`, `contrast.ts`, `COLOR-BASELINE.md`
| ID | Enforces | Tenet |
|---|---|---|
| `spacing.offScale` | px ∈ Carbon 2× scale | 7 |
| `type.offRamp` | font size ∈ IBM Plex ramp | 1/7 |
| `opacity.notReserved` | transparency from the named set, not mid-fade | 6/8 |
| `contrast.text` ≥ 4.5:1 · `contrast.nonText` ≥ 3:1 | WCAG / Carbon SC 1.4.11 | 6 |
| `neutralRoles` | surface=light end, text=dark end, border subtle, line light, one accent | 6/7 |

## Charts — `pickChart` (chooser) + `chartLint` (gate)
| ID | Enforces | Tenet | Sev |
|---|---|---|---|
| `pickChart` | intent+data → chart, key quantity on **position**; data vetoes intent | 1/3 | — |
| `banned.threeD` / `exploded` / `dualAxis` / `gradientForMeaning` | distortion-free encodings | 8 | error |
| `scale.barBaseline` | bars start at 0 | 8 | error |
| `palette.quantitativeAsCategorical` / `categoricalAsOrdered` | palette type fits data | 6 | warn |
| `palette.overflow` | categorical ≤ 6, tail → "Other" | 6 | error |
| `pie.tooManySlices` | angle readable (≤ ~6) | 1 | warn |
| `title.missing` | takeaway title present | 1 | warn |
| `contrast.series` | series colour ≥ 3:1 on bg | 6 | warn |
| *(component)* alt-data-table; theme-aware contrast-gated palette | 6 | — |

## Diagrams — `idiomPicker` + `layout` + `diagramLint`
| ID | Enforces | Tenet | Sev |
|---|---|---|---|
| `idiomPicker` | intent → idiom; distance-true only on MDS | 1/2 | — |
| `layout.uniformSizes` + BK/BALANCED | uniform tiles, straight spine | 3/7 | — |
| `nodeOverlap` | no node occludes another | 7 | error/warn |
| `labelOverlap` | labels don't collide | 7 | warn |
| `edgeCrossings` | minimise crossings | 7 | error/warn |
| `proximity.accidentalAdjacency` / `weakSeparation` / `longEdges` | proximity earns meaning | 4 | err/warn |
| `grouping.regionOverlap` | group regions don't overlap | 4 | error |
| `paletteOverflow` | colour-group cap | 6 | error |
| `legibility` / `aspect` | min label px; sane aspect | 7 | warn |
| `similarity.edgesObscureDistance` | sparse edges when distance carries meaning | 2/5 | warn |
| `timeline.undatedOnAxis` | undated items off the time axis (never faked) | 8 | error |
| `force.noGrouping` | force positions need explicit communities | 4 | warn |
| *(component)* alt-data-table; unknown marked (dashed+?); dropped disclosed | 8 | — |

## Edges — `planEdges` + `edgeLint`
| ID | Enforces | Tenet | Sev |
|---|---|---|---|
| `planEdges` | fan → fixed port side + corner budget; dashed = no/async/uncertain; ER undirected | 3/8/9 | — |
| `route.crossesNode` | connector never crosses a node it doesn't touch | 7 | error |
| `route.cornersOverBudget` | corners ≤ fan budget | 7 | warn |
| `route.manyCrossings` | edge crossings within budget | 7 | warn |

---

## OVERLAP MAP — patterns that recur across families

| Pattern | Appears in | Status | Action |
|---|---|---|---|
| **Contrast gate** (text 4.5 / non-text 3) | chart `contrast.series`, diagram `roleStyle`/`GroupLayer`, edge `EdgeLayer`, foundation | **Shared** (`contrast.ts`) ✓ | the model — keep all families calling it |
| **Categorical colour cap ≤6 + tail→Other** | chart `palette.overflow`+`capCategories`, diagram `paletteOverflow` | **Duplicated** (two CAP consts) | hoist one `capPalette`/`CAP` to foundation |
| **No occlusion / overlap** | diagram `nodeOverlap`, `labelOverlap`, `grouping.regionOverlap`; edge `route.crossesNode` | **Partial** — label overlap checked in the diagram *data model* but **not on rendered ELK routes** | shared overlap-geometry util; extend label-overlap to `EdgeLayer`/`edgeLint` (the yFiles gap) |
| **Minimise crossings** | diagram `edgeCrossings`, edge `route.manyCrossings` | **Duplicated** concept | one crossing metric in foundation |
| **Tell the truth / mark unknown / never drop** | chart `scale.barBaseline`+dropped-count, diagram unknown-marking+`timeline.undatedOnAxis`+disclosures, edge dashed-inferred | **Distributed** (Tenet 8/9) | a shared "honesty" mixin: mark-unknown + count-dropped + dashed-inferred |
| **Position first / earn distance** | chart position-encoding, diagram MDS + distance-meaningless blocks, edge ports-by-structure | **Distributed** (Tenet 2/3) | principle is shared; enforcement stays per-family |
| **One accent / colour earns place** | chart single-colour bar, diagram `colorPolicy` minimal↔rich, foundation `neutralRoles` | **Partial** (baseline shared, applied per-family) | drive both off `neutralRoles` accent |
| **Declutter / data-ink** | chart (no gridline clutter), diagram `legibility`/`aspect`, edge corner-budget | **Distributed** (Tenet 7) | keep per-family; shared metric optional |
| **Alt-data-table (a11y)** | chart component, diagram component | **Duplicated** implementation | one shared `<AltTable>` |
| **Scale discipline / no magic numbers** | foundation `lintPrimitives` | **Shared** ✓ | the model |

### What to consolidate next (from the map)
The **Shared** rows (contrast, scale discipline) are the template. The
**Duplicated** rows are the debt to pay down — move into `components/foundation/`:
1. `capPalette` + the categorical cap constant (one source).
2. a geometry util for **overlap + crossings** (used by `diagramLint`, `edgeLint`,
   and a new **label-overlap check on rendered routes** — the yFiles gap from
   `BENCHMARKS.md`).
3. a shared `<AltTable>` and an "honesty" helper (mark-unknown / count-dropped).

This is the same move that made the primitives + contrast tier real: lift the
recurring rule into the foundation, have every family call it.

---
*Generated from the live rule sets: `chartLint.ts`, `diagramLint.ts`,
`edgeLint.ts`, `primitives.ts` (`lintPrimitives`), `contrast.ts`, and the
`*-POLICIES.md` / `COLOR-BASELINE.md` / `BENCHMARKS.md` docs.*
