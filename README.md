# ScnTw Design System

A **shadcn/ui + Tailwind CSS v4** design system with a three-tier token
architecture, six switchable design layers, and full light/dark theming —
documented, themed and interaction-tested in Storybook.

## Highlights

- **45 components** (`components/ui`) — the full shadcn/ui set on Radix primitives
- **3-tier tokens** (`app/globals.css`) — primitives (11-step colour ladders, elevation, motion) → semantic roles → functional status colours (`success` / `warning` / `info` / `destructive`)
- **Design Layers** — re-skin every component live from the Storybook toolbar: shadcn Neutral, Material 3, Fluent 2, Carbon, Apple HIG, Expressive
- **Foundations docs** — Color Palette, Typography, Spacing, Elevation, Radius, Motion
- **Patterns** — composed real-world screens (e.g. Settings Page)
- **Light/dark**, radius, primary-colour and density toolbar overrides
- **a11y addon + interaction tests** on key components

## Getting started

```bash
npm install
npm run storybook      # component workshop on http://localhost:6006
npm run dev            # Next.js app on http://localhost:3000
npm run build-storybook
```

## Structure

```
app/globals.css        # all design tokens (3 tiers) + Tailwind theme mapping
components/ui/         # 45 shadcn/ui components
stories/
  Introduction.mdx     # start here
  design-system/       # foundation docs (colors, type, spacing, …)
  patterns/            # composed screens
  ui/                  # one story file per component
.storybook/            # main, preview (design layers), manager (branding)
```

## Token architecture

| Tier | Purpose | Examples |
|------|---------|----------|
| 1 — Primitives | Raw values, no meaning | `--blue-600`, `--neutral-200`, `--shadow-md`, `--duration-fast` |
| 2 — Semantic | Role aliases used by components | `--primary`, `--card`, `--border`, `--ring` |
| 3 — Functional | Status communication | `--success`, `--warning`, `--info`, `--destructive` |

Components reference Tiers 2–3 only, so a re-brand is a token swap.
Tailwind's built-in colour utilities are intentionally left untouched;
primitives are consumed as raw CSS variables.

## Stack

Next.js 16 · React 19 · Tailwind CSS v4 · Storybook 10 (nextjs-vite) · Radix UI · CVA
