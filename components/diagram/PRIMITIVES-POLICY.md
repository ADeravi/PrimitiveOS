# Primitives Policy — the foundation tier (Carbon-grounded)

The chart, diagram and edge policies all draw from a small set of visual
**primitives**: spacing, type, colour shade, transparency, radius, stroke. Left
unmanaged these become magic numbers (`PAD_X = 20`, `13px`, `opacity: 0.78`).
This tier replaces them with one principled, checkable set — IBM **Carbon's**
rules, mapped onto our own oklch tokens so theming still works. Source of truth:
`components/diagram/primitives.ts`.

## The rules

**Spacing — Carbon 2× scale.** Every padding, label clearance, inter-node gap and
lane height is a step on `$spacing-01…13` (2, 4, 8, 12, 16, 24, 32, 40, 48, 64,
80, 96, 160 px). Carbon's own guidance: *"deviating from the scale should be
avoided."* `sp(5)` = 16. (Carbon also frames spacing as Gestalt — distance makes
relationship and hierarchy — which is exactly the diagram proximity policy.)

**Type — IBM Plex ramp, by role.** Labels map to fixed type roles, never raw px:
title = heading, node label = body-compact, edge label = caption. Each role
carries a size / weight / line-height from the ramp.

**Shade & transparency — the important one.** In Carbon, importance, selection
and hover are a **darker STEP on the colour ramp, never opacity**. So:

- shade by **step**, not by fading;
- **transparency is reserved** for true overlays only — each value named and
  intentional (`hullFill 0.1`, `dimNode 0.18`, `fadedEdge 0.08`, `ghost 0.6`,
  `inferred 0.45`, the exploratory-edge dims, `label 0.8` for 80 % text). Anything
  outside that set is a smell.

**Radius & stroke.** A tiny radius scale (`sharp/sm/md/pill`) and stroke weights
on the 2× grid (`hair 1 / regular 1.5 / bold 2 / heavy 2.5`). One regular weight
for every box; `heavy` for marked (initial/final) states and highlights.

## What the linter / probe enforces

`lintPrimitives({ spacing, typeSize, opacity })` flags:

| Rule | Catches |
|---|---|
| off the spacing scale | a px value not on `$spacing-01…13` (with the nearest step) |
| off the type ramp | a font size not on the Plex ramp |
| transparency-as-shade | an opacity outside the reserved set — *shade with a step, not transparency* |

The headless probe runs it over the constants the diagram actually uses
(`LAYOUT_SPACING`, `TYPE`, `OPACITY`), so a magic number creeping back fails CI:

```
npm run probe:diagram   # → primitives ✓ on Carbon scales, before the geometry/edge checks
```

## The manifesto, on primitives

| Tenet | On a primitive |
|---|---|
| 6 One accent / consistent | one stroke weight, one radius family, shade by step not whim |
| 7 Declutter to the data | spacing on a scale; transparency only where it means "recede" |
| 8 Tell the truth | `ghost`/`inferred` opacities are *named* meanings, not decoration |

---

### Sources
- **Carbon spacing** — 2× scale, "deviating should be avoided" ([spacing/overview](https://carbondesignsystem.com/elements/spacing/overview/)).
- **Carbon colour tokens** — 10–100 steps; state & elevation are solid step tokens (`$layer-01/02/03`, `$layer-hover/selected`), **not** opacity ([color/tokens](https://carbondesignsystem.com/elements/color/tokens/)).
- **Carbon / IBM Plex type** ramp (productive sets).
- **Visualisation Manifesto** (`MANIFESTO.md`).
