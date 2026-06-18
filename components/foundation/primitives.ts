// foundation/primitives.ts — the FOUNDATION policy tier: the visual primitives
// EVERY chart, diagram, edge and component draws from, grounded in IBM Carbon's
// rules but mapped onto our own tokens so theming survives. Replaces magic
// numbers with a small, principled, checkable set: spacing on a scale, text on a
// ramp, shade as a STEP (never opacity), transparency reserved for true overlays.
//
// Canonical home (shared system-wide). Sources: Carbon spacing (2x scale,
// "deviating should be avoided"), Carbon type ramp (IBM Plex), Carbon colour
// tokens (10–100 steps; state/elevation are solid step tokens, NOT opacity).

// ── Spacing — Carbon 2x scale, $spacing-01 … $spacing-13 (px) ─────────────────
export const SPACING = [2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160] as const;
/** sp(5) === 16 ($spacing-05). 1-indexed to match Carbon's token names. */
export const sp = (step: number): number => SPACING[Math.max(1, Math.min(SPACING.length, step)) - 1];
export const onSpacingScale = (px: number): boolean => (SPACING as readonly number[]).includes(px);
export const nearestSpacing = (px: number): number =>
  SPACING.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a));

// ── Type — Carbon / IBM Plex ramp, by ROLE (size px / weight / line-height) ───
export const TYPE = {
  title: { size: 16, weight: 600, line: 1.375 },     // heading-compact-02
  nodeLabel: { size: 14, weight: 400, line: 1.43 },  // body-compact-01
  edgeLabel: { size: 12, weight: 400, line: 1.34 },  // label-01 / caption-01
  caption: { size: 12, weight: 400, line: 1.34 },
} as const;
/** the allowed ramp sizes (Carbon productive sets) for off-ramp detection. */
export const TYPE_RAMP = [12, 14, 16, 20, 24, 28, 32, 42] as const;
export const onTypeRamp = (px: number): boolean => (TYPE_RAMP as readonly number[]).includes(px);

// ── Shade & transparency ─────────────────────────────────────────────────────
// THE RULE (Carbon): importance / selection / hover are expressed as a darker
// STEP on the colour ramp, never as opacity. Transparency is reserved for true
// overlays — each one named and intentional, so it can be audited.
export const OPACITY = {
  solid: 1,
  label: 0.8,          // edge-label text — 80% of the foreground (≈80% black on light)
  ghost: 0.6,          // uncertain element shown but muted (Tenet 8)
  inferred: 0.45,      // AI/derived connection (Tenet 9)
  exploreEdge: 0.4,    // force/cluster web edge (dim by default, Tenet 5)
  similarityEdge: 0.3, // distance-true web edge
  dimNode: 0.18,       // faded node when a neighbourhood is focused
  hullFill: 0.1,       // group-region wash
  fadedEdge: 0.08,     // faded edge when a neighbourhood is focused
} as const;
export const RESERVED_OPACITY = new Set<number>(Object.values(OPACITY));
export const isReservedOpacity = (o: number): boolean => o === 1 || RESERVED_OPACITY.has(o);

// ── Radius (small, Carbon-ish) & stroke (on the 2x grid) ─────────────────────
export const RADIUS = { sharp: 0, sm: 4, md: 8, pill: 20 } as const;
export const STROKE = { hair: 1, regular: 1.5, bold: 2, heavy: 2.5 } as const;

// ── the primitives linter ────────────────────────────────────────────────────
export interface PrimitiveViolation { kind: "spacing" | "type" | "opacity"; value: number; detail: string }
export function lintPrimitives(input: { spacing?: number[]; typeSize?: number[]; opacity?: number[] }): {
  violations: PrimitiveViolation[]; pass: boolean;
} {
  const v: PrimitiveViolation[] = [];
  (input.spacing ?? []).forEach((px) => {
    if (!onSpacingScale(px)) v.push({ kind: "spacing", value: px, detail: `${px}px is off the spacing scale (nearest ${nearestSpacing(px)}).` });
  });
  (input.typeSize ?? []).forEach((px) => {
    if (!onTypeRamp(px)) v.push({ kind: "type", value: px, detail: `${px}px is off the type ramp.` });
  });
  (input.opacity ?? []).forEach((o) => {
    if (!isReservedOpacity(o)) v.push({ kind: "opacity", value: o, detail: `opacity ${o} is not in the reserved set — shade with a step, not transparency.` });
  });
  return { violations: v, pass: v.length === 0 };
}
