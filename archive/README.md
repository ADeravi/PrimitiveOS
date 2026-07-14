# archive/ — the retired pre-TokenOS token pipeline

Archived 2026-07-14. Nothing here is wired into the app, Storybook, or CI. Kept (not deleted) so the
history and the intent are recoverable — `git log --follow archive/<file>` still works.

## Why these were retired

ScnTw used to run its **own** token engine, from before TokenOS existed (ADR-090 replaced the Radix /
hand-written token source with TokenOS). After that migration the old engine kept sitting in the repo,
still wired to `package.json` scripts — but it had quietly stopped working, because **its inputs are no
longer the source of truth**:

- `app/globals.css` now contains **0** `--semantic-*` and **0** `--primitive-*` declarations. The values
  live in `app/tokenos/tokens-referential.css` (118 of each), pulled in via
  `@import "./tokenos/tokenos.css"`.
- `export-tokens.mjs` read `app/globals.css` + `@radix-ui/colors` from `node_modules` — i.e. the two
  places the tokens had *moved out of*. It could no longer regenerate anything real.
- `sd.config.mjs` read the (stale) `tokens.json` and wrote `platform-outputs/`, which **nothing
  consumed** — not the app, not Storybook, not CI. It was found holding 4 empty dirs and 0 files.

Leaving them wired up was a trap: the next `npm run tokens` would have overwritten a **published** file
(`tokens.json` is in `package.json` `exports`) with values scraped from the wrong sources.

| File | What it was | Why retired |
|---|---|---|
| `export-tokens.mjs` | `app/globals.css` + Radix → `tokens.json` | Reads sources that no longer hold the tokens. Was `npm run tokens`. |
| `sd.config.mjs` | `tokens.json` → `platform-outputs/{web,ios,android,rn}` | Output had zero consumers. TokenOS owns multi-platform emission. Was `npm run build:tokens`. |
| `globals.css.pre-tokenos.bak` | Backup of `globals.css` from before the TokenOS migration | Superseded; kept for reference. |

## What replaced them

**TokenOS is the engine.** It emits the web layer, and `scripts/sync-tokenos.mjs` copies it in:

```
TokenOS  pnpm build:tokens
  → TokenOS platform-outputs/web/{tokens-referential,shadcn-theme}.css
  → npm run sync:tokenos            (copies into app/tokenos/)
  → app/tokenos/tokenos.css @imports them
  → app/globals.css @imports tokenos.css
  → app + Storybook
```

`npm run sync:tokenos -- --check` fails on drift — wire it into CI. This matters: the old, ungated path
is exactly how ScnTw shipped the CVD-broken shadcn chart palette long after TokenOS had replaced it with
Okabe-Ito and gated it (TokenOS ADR-172). TokenOS gates CVD, WCAG AA/AAA, non-text contrast and
four-platform parity; this pipeline gated nothing.

## Loose ends (deliberately NOT decided here)

- **`tokens.json` is still published** (`exports["./tokens.json"]`) and is **stale** — it carries the old
  CVD-broken `chart-1: oklch(0.646 0.222 41.116)`. With `export-tokens.mjs` archived it now has no
  generator at all. It needs a call: either regenerate it from `app/tokenos/tokens-referential.css` (the
  real source, keeping the published contract), or drop the export as a breaking change.
- **`@radix-ui/colors`** is now referenced only by comments and demo text in
  `stories/ui/collapsible.stories.tsx` — `export-tokens.mjs` was its last real consumer. It can likely go
  via `npm uninstall @radix-ui/colors` (touches the lockfile, so left alone here).

## Restoring

```bash
git mv archive/sd.config.mjs sd.config.mjs
git mv archive/export-tokens.mjs scripts/export-tokens.mjs
# then re-add the "tokens" / "build:tokens" scripts to package.json
```
