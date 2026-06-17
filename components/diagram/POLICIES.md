# Diagram Policies — grounded in the canon

These are the readability policies the Diagram guardrails enforce. They are **not
invented** — each is drawn from the data-visualisation literature (the books in
the project library) and restated as an enforceable rule the engine and linter
apply. Sources are cited inline.

The through-line, in one sentence: **the drawing must make the relationships
true** — proximity must mean relatedness, enclosure must mean membership, colour
must mean which-set, and clutter must be removed by *arrangement*, not decoration.

---

## Policy 1 — Enclosure is a membership claim (containment + non‑overlap)

**Principle (canon).** We read objects that are physically *enclosed* together,
or simply *close* together, as one group — and we do it automatically.
- Knaflic, *Storytelling with Data*, p.77: objects physically enclosed are seen
  as a group; "it doesn't take a very strong enclosure" — light shading suffices.
- Berengueres, *Introduction to Data Visualization & Storytelling*: enclosing
  elements "creates relatedness"; circular enclosures "reduce cognitive load …
  and increase meaning."
- Healy, *Data Visualization*, p.22 and Knaflic p.96: proximity, similarity,
  **connection**, enclosure are the grouping forces; connection is strong but
  "isn't typically stronger than enclosure."

**The hazard.** Because grouping is automatic, *accidental* proximity lies.
Berengueres warns: "watch out not to put unrelated objects too close to each
other, as the eye will … create relatedness." Healy: "we look for structure all
the time … we will find it in random data."

**Policy (enforced).**
1. A group's enclosure must **contain every member** (hull padded clear of its
   nodes) and must **not overlap** another group's region.
2. Lay groups out as units so their regions stay disjoint; placement *within* a
   group is free.
3. Linter rules: `proximity.accidentalAdjacency` (cross‑group nodes closer than
   the typical gap → error), `proximity.weakSeparation` (groups not visually
   distinct → enclose or separate), hull containment + hull‑overlap checks.

---

## Policy 2 — Colour means *relationship*, used sparingly and legibly

**Principle (canon).** Colour is the most powerful attention tool precisely
because it should be rare and intentional.
- Knaflic, p.133 ("Color"): "When used sparingly, colour is one of the most
  powerful tools you have … Resist the urge to use colour for the sake of being
  colourful." It "should always be an intentional decision. Never let your tool
  make this … for you." Base everything in grey; one bold accent; grey (not
  black) as the base gives colour greater contrast.
- Knaflic, p.134 ("Use colour sparingly"): a hawk is easy to spot among pigeons
  until the sky fills with variety — "too much variety prevents anything from
  standing out … there needs to be sufficient contrast." A rainbow‑ranked table
  loses all preattentive value; the fix is *saturation of a single colour* (a
  heatmap) — intensity encodes value.
- Knaflic, Ch.3: similarity of colour is used to **tie the words to the data
  points they describe** — i.e. colour expresses the *relationship* between a
  label and its objects.
- Accessibility: design for the colour‑blind and check foreground/background
  **contrast** (Knaflic cites contrast/colour‑blind checkers).

**Policy (enforced).**
1. **Adaptive, not fixed.** Simple diagram → *minimal*: neutral elements, a
   single accent (terminators). Complex diagram → *rich*: colour encodes role,
   group is carried by the enclosure, importance by weight. (Colour earns its
   place; it isn't spent when it isn't doing work.)
2. **Relationship‑legible.** A group's colour is shared across its enclosure, its
   label, and a cue on its member nodes — so the coloured label visibly governs
   its objects — and the tone is contrast‑checked (never hue‑on‑hue).
3. **Capped.** Categorical colour is capped (merge the tail into "Other") so the
   palette never recycles and makes unrelated things share a colour.

---

## Policy 3 — Edge clarity comes from arrangement, not styling

**Principle (canon).** Clutter is cognitive load; you remove it by arranging,
not decorating.
- Knaflic, Ch.3 ("clutter is your enemy"): every element "takes up cognitive
  load"; remove anything "that isn't adding informative value." Closing the
  chapter (p.98): "Leverage alignment of elements and maintain white space … Use
  contrast strategically. Clutter is your enemy."
- Knaflic on lines: the **connection** principle is what lets the eye "see order
  in the data." And dotted lines "add clutter (many dashes compared to a single
  solid line)" — so reserve dashing for **uncertainty**, not as a default.
- Kirk, *Data Visualisation: A Handbook*, Ch.10 (Composition): arrangement is a
  first‑class design decision, not an afterthought.

**Policy (enforced).**
1. A long, many‑cornered edge is a *symptom of placement*. The quality target is
   to **minimise edge length, bends, and crossings by node arrangement** — place
   related nodes adjacent so the connection is short and direct.
2. Align elements and preserve white space (consistent margins, radius, spacing).
3. Reserve dashed lines for genuine uncertainty / async-return; default flows are
   solid. Measure edge length, bends, and crossings and *re‑arrange* (not
   restyle) when they're high.

---

### Sources (project library)
- Cole Nussbaumer Knaflic — *Storytelling with Data* (Ch.3 Gestalt/clutter, Ch.4 colour).
- Andy Kirk — *Data Visualisation: A Handbook for Data Driven Design* (Ch.9 Colour, Ch.10 Composition).
- Kieran Healy — *Data Visualization* (Ch.1, gestalt inferences).
- Jose Berengueres — *Introduction to Data Visualization & Storytelling* (Gestalt: proximity, enclosure).
- Gang Su — *Instant Cytoscape Complex Network Analysis* (network layout & exploration).
