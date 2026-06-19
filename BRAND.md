# BRAND.md — ScnTw Design Token Reference

ScnTw uses a **Radix Color + shadcn/ui + Tailwind v4** three-tier token system.
The canonical source is `app/globals.css`; `tokens.json` is generated from it via `npm run tokens`.

---

## Architecture

| Tier | Where defined | Use in |
|---|---|---|
| **1 — Primitives** | `@radix-ui/colors/*.css` in `node_modules` | Never reference directly in components |
| **2 — Semantic** | `:root` block in `globals.css` | Components, Tailwind utilities |
| **3 — Functional** | `:root` block in `globals.css` | Status states; AI provenance |

### Dark mode — fully automatic

Radix ships paired `*-dark.css` files that redefine every `--scale-N` variable inside `.dark`.
Adding `.dark` to `<html>` shifts **all** semantic tokens without any manual `.dark {}` overrides.

---

## Current brand: Slate surfaces · Violet actions · Crimson AI accent

| Role | Radix scale | Key step |
|---|---|---|
| Surfaces, borders, text | **Slate** (`--slate-1…12`) | Step 1 = bg, 6 = border, 11 = muted text, 12 = heading |
| Brand actions, ring | **Violet** (`--violet-1…12`) | Step 9 = solid primary, 3 = accent bg, 11 = accent text |
| AI provenance accent | **Crimson** (`--crimson-9`) | Exposed as `--rose` |

---

## Semantic tokens (Tier 2)

### Surfaces — Radix Slate

| Token | Value | Purpose |
|---|---|---|
| `--background` | `var(--slate-1)` | Page background |
| `--foreground` | `var(--slate-12)` | Default body text |
| `--card` | `var(--slate-2)` | Card surface |
| `--card-foreground` | `var(--slate-12)` | Text on cards |
| `--popover` | `var(--slate-2)` | Popover / dropdown surface |
| `--popover-foreground` | `var(--slate-12)` | Text in popovers |
| `--muted` | `var(--slate-3)` | Muted / disabled surfaces |
| `--muted-foreground` | `var(--slate-11)` | Placeholder / helper text |
| `--border` | `var(--slate-6)` | Default border |
| `--input` | `var(--slate-6)` | Input field border |
| `--ring` | `var(--violet-7)` | Focus ring |

### Brand — Radix Violet

| Token | Value | Purpose |
|---|---|---|
| `--primary` | `var(--violet-9)` | Primary action (button fill, active state) |
| `--primary-foreground` | `var(--violet-1)` | Text on primary |
| `--secondary` | `var(--slate-3)` | Secondary button / subtle surface |
| `--secondary-foreground` | `var(--slate-12)` | Text on secondary |
| `--accent` | `var(--violet-3)` | Hover / focus highlight bg |
| `--accent-foreground` | `var(--violet-11)` | Text on accent |

---

## Functional / status tokens (Tier 3)

| Token | Value | Purpose |
|---|---|---|
| `--destructive` | `var(--red-9)` | Error / danger |
| `--success` | `var(--green-9)` | Success |
| `--success-foreground` | `var(--green-1)` | Text on success |
| `--warning` | `var(--amber-9)` | Warning |
| `--warning-foreground` | `var(--amber-12)` | Text on warning |
| `--info` | `var(--blue-9)` | Informational |
| `--info-foreground` | `var(--blue-1)` | Text on info |
| `--rose` | `var(--crimson-9)` | **AI provenance only** — see below |

### `--rose` — AI provenance accent

`--rose` is **reserved for AI-inferred content** (edges, highlights, badges).
It must never appear in search canvases or on more than 1 node per view.

Downstream consumers (e.g. Symantic Relationship Visualiser) read it as:
```js
resolveToken('--rose', 'oklch(0.514 0.222 16.935)')
```
The browser resolves the two-level chain (`--rose → --crimson-9 → concrete colour`)
at runtime, including automatic dark-mode shift.

---

## Chart palette

| Token | Value | Hue family |
|---|---|---|
| `--chart-1` | `var(--violet-9)` | Violet |
| `--chart-2` | `var(--cyan-9)` | Cyan |
| `--chart-3` | `var(--amber-9)` | Amber |
| `--chart-4` | `var(--green-9)` | Green |
| `--chart-5` | `var(--red-9)` | Red |

---

## Sidebar tokens

All sidebar tokens mirror the surface/brand pattern:
`--sidebar` → `var(--slate-2)`, `--sidebar-primary` → `var(--violet-9)`, etc.
See `globals.css` for the full list.

---

## Border radius

| Token | Value | Resolves to |
|---|---|---|
| `--radius` | `0.625rem` | Base (10 px) |
| `--radius-sm` | `calc(var(--radius) - 4px)` | 6 px |
| `--radius-md` | `calc(var(--radius) - 2px)` | 8 px |
| `--radius-lg` | `var(--radius)` | 10 px |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 14 px |

---

## Typography

Fonts are loaded via `next/font/google` in `app/layout.tsx`.

| Variable | Font | Usage |
|---|---|---|
| `--font-geist-sans` | Geist Sans | Default sans-serif body + UI |
| `--font-geist-mono` | Geist Mono | Code / monospace |

---

## How to change the brand colour

1. Pick a Radix hue that fits (violet → indigo, teal, etc.) — see [radix-ui.com/colors](https://www.radix-ui.com/colors).
2. In `globals.css`, replace `var(--violet-*)` references in the **Brand** section with your chosen scale.
3. Ensure the matching `@import "@radix-ui/colors/<hue>.css"` and `<hue>-dark.css` lines exist.
4. Run `npm run tokens` to regenerate `tokens.json`.
5. Never edit files inside `components/ui/` for branding — create wrappers in `components/` to preserve the shadcn update path.

To add a new semantic token: add the `--name: var(--scale-step);` line to `:root` in `globals.css`,
map it in the `@theme inline` block, then re-run `npm run tokens`.
