# Colour Baseline — neutrals, grounded in IBM Carbon

The aesthetic baseline for diagrams (and any neutral surface) is **IBM Carbon's
grey organisation**, not ad-hoc token picks. Carbon arranges neutrals as a
ten-step ramp and assigns each UI role a *specific step* — the discipline that
keeps surfaces, text and borders in a calm, legible relationship. Encoded in
`components/foundation/primitives.ts` (`GRAY`, `neutralRoles`).

## The ramp (Carbon greys)

`gray-10 #f4f4f4 · 20 #e0e0e0 · 30 #c6c6c6 · 40 #a8a8a8 · 50 #8d8d8d · 60 #6f6f6f
· 70 #525252 · 80 #393939 · 90 #262626 · 100 #161616` (+ white / black at the ends).

## The principles

1. **Surfaces at the light end, text at the dark end.** A node tile is a *light*
   surface (`gray-10` / white) with **dark** text (`gray-100`). Never a mid-grey
   fill behind text — that's the muddy, low-aesthetic look. (Carbon `$layer` /
   `$text-primary`.)
2. **Borders stay subtle.** Structural outlines are `border-subtle` (`gray-20`),
   not mid-grey; only terminators / marks step up to `border-strong` (`gray-50`).
3. **Connectors are a light divider.** Edges use `gray-30` — visible but quiet,
   so they recede behind nodes and labels.
4. **Pick from the ENDS, never the middle, when a fill sits behind content.** A
   label chip is `white`/`gray-100` with the *opposite* end as text — a mid-grey
   chip makes both a darker and a lighter mark disappear.
5. **One accent, used sparingly.** Simple (minimal) diagrams are fully neutral.
   Only complex (rich) diagrams add a single accent — and as a *border*, not a
   full fill, so colour encodes role without shouting.
6. **Polarity-aware.** Roles are chosen from the canvas polarity (light vs dark),
   so both themes read correctly; the resolved canvas colour decides, not a token
   string a `<canvas>` renderer can't parse.
7. **Contrast gates hold throughout** — text ≥ 4.5:1, non-text ≥ 3:1 (Carbon SC
   1.4.11), via the shared `contrast.ts`.

## Role map (`neutralRoles`)

| Role | Light canvas | Dark canvas |
|---|---|---|
| surface (node fill) | gray-10 | gray-90 |
| surfaceAlt (chip / plate) | white | gray-100 |
| text | gray-100 | gray-10 |
| text soft | gray-70 | gray-40 |
| border (subtle) | gray-20 | gray-70 |
| border strong (terminator/mark) | gray-50 | gray-50 |
| line (connector) | gray-30 | gray-60 |

---

### Sources
- **Carbon — Colour** (ramp + token roles: `$background`, `$layer`, `$border-subtle`/`$border-strong`, `$text-primary`/`$text-secondary`): https://carbondesignsystem.com/elements/color/overview/
- **Carbon — Themes** (white / gray-10 / gray-90 / gray-100; layers alternate, state via solid steps).
- **IBM Design Language** — colour foundations.
