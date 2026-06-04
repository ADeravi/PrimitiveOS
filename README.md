# ScnTw Design System

Canonical **shadcn/ui + Tailwind v4** neutral baseline, scaffolded via the official shadcn CLI.
Ready to link to Claude Design (`claude.ai/design`) and customise freely.

## Stack

- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind v4** (`@tailwindcss/postcss` — no `tailwind.config.js`, theme lives in CSS)
- **shadcn/ui** `new-york` style, `neutral` base colour, CSS variables enabled
- **46 components** installed from the shadcn registry
- `TooltipProvider` hoisted to root layout

## Quick start

```bash
npm install
npm run dev
```

## Branding

See [`BRAND.md`](./BRAND.md) for the full default token reference and instructions on how to apply brand colours.
All colour tokens use **OKLCH** — edit `:root` and `.dark` in `app/globals.css`.

## Components

All 46 components live in `components/ui/`.  
Do **not** edit them directly for branding — create wrapper components in `components/` instead to preserve the shadcn update path.

## Updating components

```bash
npx shadcn@latest add <component> --overwrite
```
