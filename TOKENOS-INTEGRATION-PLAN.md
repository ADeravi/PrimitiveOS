# TokenOS ↔ ScnTw integration — fix plan

*Written 2026-07-14, after archiving the retired pre-TokenOS pipeline (see `archive/README.md`).*

## The shape of the problem

TokenOS is the engine. It gates CVD distinctness (50 contexts), WCAG AA/AAA, non-text contrast, and
four-platform parity. **ScnTw consumes it by copying files** — so every copied artifact is a drift vector,
and drift is *silent*: it bypasses every gate TokenOS has. This is not hypothetical. ScnTw shipped the
CVD-broken shadcn chart palette long after TokenOS replaced it with Okabe-Ito and gated it at ΔE 8
(TokenOS ADR-172). The copy rotted 67 lines and nothing noticed.

`app/tokenos/` holds four files. Three are TokenOS-derived; only two are currently synced:

| File | Origin | Synced? |
|---|---|---|
| `tokenos.css` | hand-written wrapper (`@import`s the CSS below) | n/a — stable |
| `tokens-referential.css` | TokenOS `platform-outputs/web/` | ✅ `sync:tokenos` |
| `shadcn-theme.css` | TokenOS `platform-outputs/web/` | ✅ `sync:tokenos` |
| `profile-deltas.json` | `tokenos build --profile <name>` deltas | ❌ **hand-regenerated → drifts** |

Plus `tokens.json` (published) and `a11y.css` (never arrives at all). Details per fix below.

## Decision required before F1

`tokens.json` is a **published API** (`package.json` → `exports["./tokens.json"]`). Two paths:

- **(a) Re-point it at TokenOS** *(recommended)* — keeps the contract, makes the published surface the
  gated output. F1 below assumes (a).
- **(b) Drop the export** — cleaner, breaking for anyone importing `scntw-ds/tokens.json`. If (b), F1
  collapses to "delete `tokens.json` + the export entry" and the DoD is just "no stale published file."

Everything else is independent of this call.

---

## F1 — `tokens.json` is published, stale, and has no generator · **P0** · M · ✅ DONE

**Problem.** It's exported, and it carried the CVD-broken `chart-1: oklch(0.646 0.222 41.116)`. Its old
generator (`export-tokens.mjs`, now archived) read `app/globals.css` + `@radix-ui/colors` — both of which
stopped holding the tokens after ADR-090. So consumers of `scntw-ds/tokens.json` got a palette TokenOS
would fail the build on.

**Fix.** New `scripts/export-tokens.mjs` derives `tokens.json` from `app/tokenos/tokens-referential.css`,
resolving the referential tier (`--semantic-primary: var(--primitive-neutral-900)`) to literals. `--check` added.

> **A DoD line in the first draft of this plan was WRONG and is corrected here.** It said *"every
> `--semantic-*` / `--primitive-*` in the CSS (118 each) is represented — no silent drops."* That would have
> **silently expanded a published contract**: `tokens.json` publishes a *curated subset* — 32 semantic roles
> (the shadcn-era surface) — while the CSS exposes 59 (tertiary, containers, inverse-primary, hover/muted
> variants). Verified: nothing published is missing from the CSS, so the subset is by design, not by accident.
> Expanding the surface is a separate decision. The generator therefore takes the **key set and each `$type`
> from the existing tokens.json** and recomputes only `$value`.

**Definition of done** — all met
- ✅ `npm run tokens` regenerates from `app/tokenos/tokens-referential.css`; no `globals.css` / Radix read.
- ✅ Contract preserved: **147 keys before and after, 0 added, 0 removed**; every `$type` unchanged.
- ✅ Values corrected: 22 changed, incl. `semantic.light.chart-1` → Okabe-Ito `oklch(0.753 0.158 76.8)`.
- ✅ A published token missing from the CSS is a **hard error** (never a silent drop). CSS roles outside the
  contract are *reported*, never added (35 today).
- ✅ `npm run tokens -- --check` exits 1 on drift, green on a clean tree (both verified).
- ✅ Runs in CI (F2).

---

## F2 — no CI gate on any of this · **P0** · S · ✅ DONE

**Problem.** `sync:tokenos --check` existed but nothing ran it. Same for F1's check. Without a gate, every fix
here decays back to the state we just cleaned up. This *is* the root cause — the copies didn't rot because
anyone was careless; they rotted because **nothing checked**.

**Fix.** `.github/workflows/tokens-drift.yml`, deliberately **two jobs**:
- `tokens-json` — runs `npm run tokens -- --check`. Independent of TokenOS (the CSS is committed here), so this
  gate survives a TokenOS checkout/access failure. Catches "synced the CSS but forgot to regenerate tokens.json".
- `tokenos-sync` — checks out `ADeravi/TokenOS@main`, builds it (mirroring TokenOS's own
  `build-tokens.yml`: pnpm 9 + `node packages/core/index.mjs`), then runs `npm run sync:tokenos -- --check`
  with `TOKENOS_ROOT`.

**Definition of done** — all met
- ✅ Both checks run on every PR (`on: pull_request`), as separate jobs.
- ✅ Drift **fails**, verified not assumed: tampering `--semantic-chart-1` in the committed CSS → gate 1 exit 1
  *and* gate 2 exit 1; restored → both exit 0. *(Verified by running the exact commands the workflow runs — not
  through the Actions runner, which I can't execute here.)*
- ✅ TokenOS acquisition pinned + reproducible: `repository: ADeravi/TokenOS`, `ref: main`, fixed `path`,
  `TOKENOS_ROOT` env.

**Note.** `ref: main` means ScnTw goes red when TokenOS ships a token change, until someone runs
`npm run sync:tokenos` — that is the intent. Pin a tag/SHA if you'd rather adopt TokenOS changes deliberately.
If `ADeravi/TokenOS` is private, `tokenos-sync` needs a read-scoped PAT (a commented `token:` line marks the spot).

---

## F3 — `profile-deltas.json` drifts (third vector) · **P1** · M

**Problem.** It's TokenOS-derived — its own `$generated` header says *"from `tokenos build --profile <name>`
… Regenerate when profiles/axes change"* — but TokenOS emits no such file, so it's produced by an ad-hoc
manual run and `sync:tokenos` doesn't cover it. `.storybook/preview.tsx` imports it, so the Storybook's
profile switching is driven by a file that silently goes stale whenever TokenOS profiles/axes change.

**Fix.** Generate it: script `tokenos build --profile <name>` per profile in `tokens/profiles.json`, diff
vs default light `:root`, emit the same JSON shape. Fold into `sync:tokenos` so one command covers all
TokenOS-derived artifacts.

**Definition of done**
- One command regenerates `profile-deltas.json` from TokenOS — no hand-editing.
- Profile list is **read from** TokenOS `tokens/profiles.json`, not hardcoded (it's 8 today; it will change).
- Covered by `sync:tokenos -- --check` → drift fails CI (F2).
- Storybook profile switching still works (spot-check `material`).
- Shape unchanged (`.storybook/preview.tsx` consumes it unmodified).

---

## F4 — TokenOS's high-contrast layer never reaches ScnTw · **P1** · M · *needs a product call*

**Problem.** `tokenos.css` imports only the two CSS files. There's no `a11y.css`, so **none** of TokenOS's
high-contrast work exists in ScnTw — including the brand×HC arc (ADR-174/177/179/180) that neutralises a
brand's primary under HC to clear a CVD collision. ScnTw simply has no HC mode from TokenOS.

**Not a copy — a decision.** Adding it introduces an HC layer to ScnTw's CSS surface and interacts with
`.storybook/addon-themes`. Confirm ScnTw *wants* HC before building it.

**Definition of done**
- `a11y.css` synced by `sync:tokenos` + imported by `tokenos.css`, or an explicit written decision that
  ScnTw does not ship HC (recorded in `archive/README.md` or a new ADR-equivalent).
- If shipped: HC is togglable in Storybook, and a brand's primary is observably neutral under HC while the
  focus ring keeps its brand colour (the ADR-177/179/180 behaviour).
- Covered by `sync:tokenos -- --check`.

---

## F5 — hygiene: `@radix-ui/colors` + empty `platform-outputs/` · **P2** · S

**Problem.** `@radix-ui/colors` is a dependency whose last real consumer (`export-tokens.mjs`) is archived;
remaining hits are a comment and demo *text* in `stories/ui/collapsible.stories.tsx`. `platform-outputs/`
is 4 empty dirs, untracked, zero consumers (my `rm` hit a sandbox permission error).

**Definition of done**
- `npm uninstall @radix-ui/colors`; lockfile updated; `npm run build`, `typecheck`, and `storybook` all pass.
- No `@radix-ui/colors` import anywhere (demo text may stay).
- `platform-outputs/` gone, or `.gitignore`d if something recreates it.

---

## F6 — retire the copy entirely: `@tokenos/tokens-web` · **P3** · L · *the end state*

**Problem.** F1–F3 make the copies *checked*, not *unnecessary*. TokenOS has no web package —
`tokens-rn` is publishable, `tokens-ios`/`tokens-android` are `private: true`, and there's no web
equivalent. That gap is *why* ScnTw copies raw CSS, against DISTRIBUTION.md §1 ("package the contract").

**Fix.** Build `@tokenos/tokens-web` in TokenOS (mirroring `tokens-rn`); ScnTw depends on it (workspace
link first, registry later); delete `app/tokenos/*.css` + `sync-tokenos.mjs`.

**Definition of done**
- `@tokenos/tokens-web` builds from the pipeline and is versioned; TokenOS's 15 gates stay green.
- ScnTw imports it; `app/tokenos/*.css` and `scripts/sync-tokenos.mjs` are deleted (not archived — F6
  makes them genuinely dead).
- Storybook renders identically before/after (no value change — pure plumbing).
- The drift checks from F2 are removed *because there is nothing left to drift*.

---

## Order / status

- ✅ **F1 + F2** — done together (the published file was wrong *and* nothing guarded it; fixing one without the
  other just resets the clock). `tokens.json` now regenerates from the TokenOS-synced CSS with the contract
  preserved, and both drift gates run in CI.
- ⬜ **F3** — `profile-deltas.json`, the last silent drift vector. **Next.**
- ⬜ **F4** — high-contrast layer. Needs a product call before code.
- ⬜ **F5** — hygiene (`@radix-ui/colors`, empty `platform-outputs/`).
- ⬜ **F6** — `@tokenos/tokens-web`; the structural end state.

After F1+F2, the *published* surface is correct and guarded. **F3 is still open**, so the Storybook's profile
switching can still drift silently — that's the remaining hole.

F6 supersedes F1's sync-side and F2's `sync:tokenos` check — but F1's *generator* survives, since
`tokens.json` is ScnTw's published surface regardless of how tokens arrive.
