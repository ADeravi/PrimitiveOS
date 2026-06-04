# BRAND.md — Design Token Reference

This file documents the **default shadcn/ui neutral baseline** as shipped.  
Edit values here when you are ready to apply a brand; then mirror every change  
into both `:root` and `.dark` inside `app/globals.css`.

---

## Base Color — Neutral (OKLCH)

All colour tokens use the OKLCH colour space (`oklch(L C H)`).  
Neutral has **zero chroma (C = 0)**, so hue (H) is irrelevant — every swatch
is a pure grey.  Change C and H together when you introduce brand colour.

### Light mode (`:root`)

| Token | Value | Purpose |
|---|---|---|
| `--background` | `oklch(1 0 0)` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | Default body text |
| `--card` | `oklch(1 0 0)` | Card surface |
| `--card-foreground` | `oklch(0.145 0 0)` | Text on cards |
| `--popover` | `oklch(1 0 0)` | Popover / dropdown surface |
| `--popover-foreground` | `oklch(0.145 0 0)` | Text in popovers |
| `--primary` | `oklch(0.205 0 0)` | Primary action (button fill, active state) |
| `--primary-foreground` | `oklch(0.985 0 0)` | Text on primary |
| `--secondary` | `oklch(0.97 0 0)` | Secondary button / subtle surface |
| `--secondary-foreground` | `oklch(0.205 0 0)` | Text on secondary |
| `--muted` | `oklch(0.97 0 0)` | Muted surface (disabled, placeholder bg) |
| `--muted-foreground` | `oklch(0.556 0 0)` | Placeholder / helper text |
| `--accent` | `oklch(0.97 0 0)` | Hover / focus highlight |
| `--accent-foreground` | `oklch(0.205 0 0)` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Error / danger red |
| `--border` | `oklch(0.922 0 0)` | Default border |
| `--input` | `oklch(0.922 0 0)` | Input field border |
| `--ring` | `oklch(0.708 0 0)` | Focus ring |

### Dark mode (`.dark`)

| Token | Value |
|---|---|
| `--background` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.985 0 0)` |
| `--card` | `oklch(0.205 0 0)` |
| `--card-foreground` | `oklch(0.985 0 0)` |
| `--popover` | `oklch(0.205 0 0)` |
| `--popover-foreground` | `oklch(0.985 0 0)` |
| `--primary` | `oklch(0.985 0 0)` |
| `--primary-foreground` | `oklch(0.205 0 0)` |
| `--secondary` | `oklch(0.269 0 0)` |
| `--secondary-foreground` | `oklch(0.985 0 0)` |
| `--muted` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `oklch(0.708 0 0)` |
| `--accent` | `oklch(0.269 0 0)` |
| `--accent-foreground` | `oklch(0.985 0 0)` |
| `--destructive` | `oklch(0.704 0.191 22.216)` |
| `--border` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(1 0 0 / 15%)` |
| `--ring` | `oklch(0.556 0 0)` |

---

## Chart Palette

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` |

---

## Sidebar Tokens

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.376)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |

---

## Border Radius

| Token | Value | Resolves to |
|---|---|---|
| `--radius` | `0.625rem` | Base (10px) |
| `--radius-sm` | `calc(var(--radius) - 4px)` | 6px |
| `--radius-md` | `calc(var(--radius) - 2px)` | 8px |
| `--radius-lg` | `var(--radius)` | 10px |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 14px |

To make the UI more rounded, increase `--radius` (e.g. `0.75rem` → 12px base).  
To make it sharp/square, lower it toward `0`.

---

## Typography

Fonts are loaded via `next/font/google` in `app/layout.tsx`.

| Variable | Font | Usage |
|---|---|---|
| `--font-geist-sans` | Geist Sans | Default sans-serif body + UI |
| `--font-geist-mono` | Geist Mono | Code / monospace |

To swap fonts: replace the `Geist` imports in `app/layout.tsx`, update the  
CSS variable names, and expose them in the `@theme inline` block in `globals.css`.

---

## How to apply brand colours

1. Pick your primary brand colour and convert it to OKLCH  
   (use <https://oklch.com> or the DevTools colour picker).
2. In `app/globals.css`, edit `--primary` / `--primary-foreground` in `:root`.
3. Edit the corresponding `.dark` values to maintain parity.
4. The `@theme inline` block maps these to Tailwind utility classes automatically —  
   no `tailwind.config.js` changes needed (Tailwind v4 theme lives in CSS).
5. Never edit files inside `components/ui/` directly for branding;  
   create wrapper components in `components/` instead to preserve the shadcn update path.
