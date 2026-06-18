# Chart Policies — the same model, swapped rule set

The charts share the diagram **policy model**: one pipeline — *schema gate →
principled defaults → `validate()` linter → auto-correct → alt-data-table* — and
the same 10-tenet **Visualisation Manifesto** as the spine. Only the *rule set*
changes: where a diagram is judged on enclosure / proximity / distance, a chart
is judged on **encoding effectiveness / scale honesty / palette fit**. The caller
passes the *question* and the *data* (`pickChart`), never a chart type; the linter
(`validateChart`) refuses the dishonest result.

## The manifesto, on charts

Most tenets are *more* natural for charts than for diagrams:

| Tenet | On a chart |
|---|---|
| 1 Form follows the question | `pickChart(intent, dataShape)` chooses the chart; the title states the takeaway, not the metric name |
| 2 Distance must be earned | scatter/position encode real values; never imply a scale the data lacks |
| 3 **Position first** | the key quantity goes on an axis — position is the most accurate channel (Cleveland/Munzner). Colour = category, size = coarse |
| 4 Group by region | small multiples / faceting; the legend binds colour→series |
| 5 Dim by default | grey the field, spend one accent on the series that matters; reveal on hover |
| 6 One accent / consistent colour | one accent; consistent series colour across views; capped, colour-blind-safe palette |
| 7 Declutter to the data | drop gridlines, borders, redundant axes/labels; data-ink |
| 8 **Tell the truth** | bars hit zero; no dual axis; honest aspect; mark unknown; count dropped rows |
| 9 Fact is not inference | forecasts/projections dashed; AI-derived series marked |
| 10 Explore or explain | interactive exploration vs annotated explanation |

## What `validateChart` enforces

| Rule | Catches | Source |
|---|---|---|
| `banned.threeD` / `exploded` / `dualAxis` | distorted length/area, false correlation | Ben Jones; Knaflic |
| `banned.gradientForMeaning` | a gradient implying a progression it doesn't measure | Carbon |
| `scale.barBaseline` | bars not starting at 0 — length stops being truthful | Tenet 8 / Jones |
| `palette.quantitativeAsCategorical` | ordered data on a categorical palette → use sequential (luminance = magnitude) | Carbon / Healy |
| `palette.categoricalAsOrdered` | unordered categories on a sequential/diverging ramp | Carbon |
| `palette.overflow` | > 6 categorical colours → merge tail to "Other" | Carbon / Okabe-Ito |
| `pie.tooManySlices` | angle unreadable past ~6 slices → bar/treemap | Knaflic |
| `title.missing` | no takeaway title | Tenet 1 / Knaflic |
| `contrast.series` | series colour < 3:1 on its background (non-text) | Carbon SC 1.4.11 |

Each returns a correction in the shared vocabulary (`zeroBaseline`, `useSequential`,
`clampPalette`, `swapChart`, `addTakeawayTitle`, `gateContrast`, `provideAltTable`).

## `pickChart` — the chooser

Intent + data shape → one chart, encoding the key quantity on **position**, with
the data allowed to veto the intent (trend with no time field → ranked bars;
relationship with one measure → distribution; share of > 6 parts → treemap). It's
your chart cheat-sheet (`DATAVIZ-PRINCIPLES.md`) as a deterministic function, and
the human-readable face of it is the **Charts › Choosing a Chart** doc.

## Shared with the diagrams

The truly common machinery is one module, imported by both families:
`components/charts/contrast.ts` (oklch→sRGB + WCAG `contrastRatio` / `readableOn` /
`ensureContrast`). The pattern (`validate()` → violations + corrections + grade),
the adaptive minimal/rich colour, the palette cap, the alt-data-table and the
takeaway-title rule are identical on both sides — the manifesto's "one render
pipeline for all views," now spanning charts and diagrams.

---

### Sources
- **Visualisation Manifesto** (`MANIFESTO.md`) + `DATAVIZ-PRINCIPLES.md` (chart cheat-sheet, encoding ranking).
- **Carbon Design System** — [data-viz colour palettes](https://carbondesignsystem.com/data-visualization/color-palettes/) (categorical / sequential / diverging / no-gradient-for-meaning), [chart anatomy](https://carbondesignsystem.com/data-visualization/chart-anatomy/), WCAG SC 1.4.11 non-text 3:1, alt data table.
- Knaflic, *Storytelling with Data* (zero baseline p.50; colour sparingly; declutter Ch.3). · Ben Jones, *Avoiding Data Pitfalls* (graphical gaffes; honest scales). · Healy, *Data Visualization* (encoding effectiveness p.27; perceptually-uniform palettes).
