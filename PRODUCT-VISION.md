# ScnTw DS — Product Vision & Competitive Research

*Captured: June 2026*

---

## The Idea

A multi-platform design system infrastructure that gives teams a single token contract that propagates automatically to every platform — web, React Native, iOS native, and Android native — without coupling to any upstream component library's release cycle.

### The Problem We're Solving

Large organisations run parallel engineering teams: an iOS team, an Android team, a web team. Each interprets the design system differently. When the design changes — a brand refresh, a new colour, a spacing tweak — it requires manual coordination across every platform. Drift is inevitable.

The second problem is dependency fragility. Most design systems are built *on top of* a component library (MUI, Radix, shadcn, etc.). When that library ships a breaking version, the entire design system requires a major upgrade — not because the design changed, but because the underlying implementation did. This is the MUI upgrade problem, and it affects every team building on primitives they don't own.

### The Architectural Fix

Separate the token contract from the component implementation. They version independently.

```
tokens.json  (owned, W3C format, OKLCH source)
     │
     ▼  Style Dictionary pipeline
     ├── @scntw/tokens-web       → CSS custom properties (Tailwind / web)
     ├── @scntw/tokens-ios       → Swift Color + Motion extensions
     ├── @scntw/tokens-android   → colors.xml + Kotlin Compose constants
     └── @scntw/tokens-rn        → TypeScript constants (React Native / NativeWind)

     │  consumed by
     ▼
     ├── @scntw/components-web       (Radix/shadcn adapter)
     ├── @scntw/components-rn        (NativeWind adapter)
     ├── @scntw/components-ios       (SwiftUI adapter)
     └── @scntw/components-android   (Compose adapter)
```

When Radix ships a breaking change → only `@scntw/components-web` needs updating. Token packages are untouched.
When a colour changes in `tokens.json` → all four platform packages rebuild automatically. Components pick it up at build time. No manual coordination.

### The Designer Access Problem

Every existing tool is either a Figma plugin (designers locked into Figma), a developer CLI (no designer access), or an enterprise SaaS with an account manager and a six-week onboarding. Nobody ships a web playground where a designer can change fonts, adjust colour sliders, see live component previews, and export a `tokens.json` — without installing anything locally.

This is the designer playground: a hosted Next.js page at `/playground`, no Node.js required.

### What We're Building (in order)

1. **Token pipeline** — `tokens.json` → Style Dictionary → all platform outputs (OKLCH→sRGB for native). `sd.config.mjs` written; `npm run build:tokens` emits to `platform-outputs/`.
2. **Designer playground** — `/playground` in Next.js. Live font picker, OKLCH colour sliders, radius/density controls, live component preview, export to `tokens.json`.
3. **Component distribution** — shadcn-compatible registry + `npx scntw add <component>` CLI. Anyone can scaffold a design system in minutes.
4. **CI/CD pipeline guarantee** — token change → GitHub Action → publishes versioned platform packages → all consumer apps pick it up automatically.

---

## Competitive Research

*Researched June 2026 — all funding/pricing figures from public sources.*

---

### Enterprise Platforms

#### Supernova
- **What**: Figma→tokens→documentation→code export. The most feature-complete enterprise platform.
- **Funding**: $25.2M total. $9.2M Series A, September 2025 (YC-backed).
- **Customers**: SoFi, Hotmart, TheFork.
- **Multi-platform**: Has open-source iOS Swift and Android Kotlin exporters (GitHub: `Supernova-Studio/exporter-ios`, `exporter-ios-android`). But they're custom exporter plugins requiring per-project configuration — not zero-config.
- **AI play (2025–2026)**: Repositioning as "the semantic foundation for AI agents to build on-brand features."
- **Pricing**: Free / Team / Enterprise. Enterprise unlocks SSO, approval workflows, dedicated support.
- **Weaknesses**: Figma-dependent. Native output requires custom setup. No OKLCH awareness. No designer playground. Expensive at enterprise tier.

#### Knapsack
- **What**: "Digital production platform" — design-to-code workflows, component rendering, design system governance.
- **Funding**: $20.8M total. $10M Series A, October 2025 (Builders VC, Crosslink Capital).
- **Customers**: Dozens of Fortune 1000 companies.
- **Multi-platform**: No true native iOS/Android output. Web and React-focused.
- **AI play**: Adding AI features alongside the Series A.
- **Pricing**: Enterprise-only. Reported ~$50k+/year.
- **Weaknesses**: Dev-centric — designers can't use it without help. No native output. Heavy enterprise sales cycle. Not accessible to smaller teams.

#### Zeroheight
- **What**: Started as a documentation platform, evolved into system management. Trusted by 20% of Fortune 100.
- **Pricing**: 3-year TCO for a 10-user Starter plan ≈ $57,600. Enterprise: $45–90/user/month.
- **Multi-platform**: No token pipeline. No native output. Documentation only.
- **Weaknesses**: Doesn't touch tokens or code. A style guide tool dressed as a design system platform.

#### Specify
- **What**: "Design Token Engine." Multi-source sync (Figma Variables + Tokens Studio simultaneously). 50+ token types.
- **Status**: Active as of late 2025.
- **Pricing**: Not public. ~$30k/year reported, plus 6 weeks of integration engineering (~$50k additional).
- **Multi-platform**: Token export only. No native Swift/Kotlin output pipeline.
- **Weaknesses**: Expensive for what it does. Still requires engineering effort to wire up.

#### Backlight *(shut down June 1, 2025)*
- **What**: Tokens + components + stories + documentation + npm publishing in one platform.
- **Funding**: None raised — bootstrapped French startup.
- **Why it failed**: Best proposition in the space, but couldn't get enterprise distribution without funding. Confirms the market rewards traction over features.

---

### Token Pipeline Tools

#### Style Dictionary (Amazon — open source)
- **What**: The industry standard for token transformation. Inputs token JSON, outputs CSS / Swift / Kotlin / XML / TypeScript.
- **Version**: V4 shipped 2024, ESM-native.
- **Pricing**: Free.
- **Weaknesses**: No UI. Requires developers. No OKLCH→sRGB conversion built in. No native colour space awareness. Infrastructure only — not a product.

#### Tokens Studio (formerly Figma Tokens)
- **What**: Figma plugin for managing tokens inside Figma. Free tier + Pro.
- **Features**: 23+ token types, GitHub sync, multi-brand/multi-theme, works with Style Dictionary via `@tokens-studio/sd-transforms`.
- **Multi-platform**: No native iOS/Android output. Requires a developer to wire Style Dictionary downstream.
- **Weaknesses**: Figma-locked. Designers can use it but developers own the pipeline. No playground.

#### Theo (Salesforce — open source)
- Superseded by Style Dictionary. Maintenance has slowed significantly.

#### Diez (open source)
- Had promise in 2020–2021 as a multi-platform token compiler. Now dormant.

---

### The W3C Standard Moment

October 2025: the W3C Design Tokens Format Module reached its **first stable version**. All major tools now converge on a standard JSON format (`$value`, `$type`). The format war is over. This removes vendor lock-in risk for new entrants and means a token file written for one tool works with all others. The timing is ideal.

---

## The Three Gaps Nobody Has Filled

### 1. Zero-config multi-platform native output
No tool takes a `tokens.json` and produces production-ready Swift Color extensions + Kotlin Compose constants automatically, with OKLCH→sRGB conversion, as a zero-config pipeline. Supernova is closest but requires per-project exporter setup. Style Dictionary can do it but requires developers.

### 2. Designer-accessible playground (no local install)
No product offers a web UI where a designer can live-edit fonts, colours, spacing, and see components update in real time — without Figma, without Node.js, without an account manager. This is a complete blind spot in the market.

### 3. Token/component decoupling as a first-class feature
The MUI upgrade problem is widely discussed but no platform enforces the separation between token contract and component implementation. Nobody ships this as a product guarantee. The architecture exists (versioned token packages + adapter packages) but no tool has packaged it.

---

## Market Signals

- Both Supernova and Knapsack raised Series A rounds within weeks of each other in autumn 2025 — institutional money sees this as a real category.
- Both are going AI-native — they're betting on design systems as the semantic layer for AI code generation. This is a valid direction but it requires the token infrastructure to already be in place. We build the infrastructure; AI leverage comes later.
- Backlight shutting down confirms: the market is hard for bootstrapped players without enterprise distribution or a strong open-source community.
- W3C standard finalised October 2025 — no format risk for new entrants building on the standard.

---

## Commercialisation Model

### Distribution: the n8n model

The core pipeline is open source. Anyone can clone the repo, run `npm run build:tokens`, and get their Swift/Kotlin/CSS output with zero friction and no sales call. This is how you penetrate the teams Supernova and Knapsack will never reach — the mid-size startup, the agency, the solo platform engineer who just wants the plumbing to work.

The cloud is where revenue lives — and critically, it adds genuine value that isn't just a paywalled feature:

- **Hosted CI/CD** — push a change to `tokens.json`, the cloud builds all platform outputs and publishes versioned packages automatically. No GitHub Actions to configure, no npm registry to manage.
- **Hosted designer playground** — web UI, shareable link, no Node.js. The thing designers actually want.
- **Versioned package registry** — `@yourorg/tokens-web@1.2.3`, `@yourorg/tokens-ios@1.2.3` published and managed on your behalf.
- **Branch previews** — PR opens → playground preview link auto-generated. Designers review token changes before merge.
- **AI layer** (see below) — the flagship cloud feature.

The key dynamic: self-hosted users hit a ceiling (no playground, no auto-publishing, no collaboration) and upgrade when they're ready. No chasing. No enterprise sales cycle for early customers.

---

### The AI Layer: the Cursor model

The self-hosted version is the pipeline. The cloud version is the pipeline plus an AI that understands your entire design system at all times.

Cursor's insight wasn't "let's make a better text editor." It was "let's put AI at the centre of the workflow so deeply that the tool becomes the AI, not a tool that has AI." The equivalent here isn't a design system tool with an AI migration button. It's an AI that understands your token structure, your component library, your platform targets, and your brand rules — and watches everything.

**What the AI does:**

*When a designer changes a colour in the playground* — the AI doesn't just update the token. It tells you which components are affected across all four platforms, flags contrast ratio implications, and suggests whether this should be a new semantic token or an override of an existing one.

*When a developer hardcodes a value in a PR* — the AI catches it: "this `#E5534B` is close to `--rose-9` — did you mean to use the token?"

*When a new platform is added* — the AI analyses the existing token structure and proposes what needs to change for the new constraints: smaller type scales, reduced motion, fewer elevation levels.

*When a team migrates from an existing system* — see below.

This is a fundamentally different product from Supernova or Knapsack. They are databases with export buttons. This is an intelligent system that understands what your design decisions mean across every surface they touch.

---

### Migration: AI-powered onboarding

The migration layer is the make-or-break piece for adoption. Most teams won't start from scratch — they have two years of accumulated Figma Variables, a `theme.ts`, a `globals.css` full of drift. Scripted importers handle the clean cases. The AI handles the real world.

**Importers (rule-based, open source):**
```
Figma Variables  ──┐
Tokens Studio    ──┤
CSS custom props ──┼──→  tokens.json  →  pipeline
MUI theme.ts     ──┤
Tailwind config  ──┘
```

Each importer runs once. You own your `tokens.json`. You're no longer coupled to the tool you came from.

**AI migration (cloud)** — for the messy real-world cases:

- Scans the codebase and finds every hardcoded `#1A1A2E`, every `font-size: 16px`, every `margin: 24px` that should be a token.
- Infers the token hierarchy (primitive → semantic → functional) from how values cluster and relate — even when no hierarchy exists yet.
- Surfaces ambiguous cases as decisions: "this blue is used for both interactive elements and error states — one token or two?" Human decides; AI executes.
- Produces a reviewable migration diff — exact changes to reference tokens instead of hardcoded values. Approvable before anything is applied.

The AI migration removes the highest-friction part of adoption — the reason teams say "we'll do it properly next quarter." It becomes the thing people pay for first, before they even care about the pipeline.

---

### Pricing direction (not decided)

- **Self-hosted**: free, open source. Full pipeline, no AI layer, no hosted services.
- **Cloud starter**: hosted playground + CI/CD + versioned publishing. ~$200–500/month per team.
- **Cloud pro**: AI layer + migration + branch previews + multi-brand. ~$1–3k/month.
- **Enterprise**: SSO, audit logs, on-prem option, SLA. Custom.

Mid-market focus: teams too small for Knapsack (~$50k/yr), too technical for Zeroheight (docs only). The open source community is the top-of-funnel; cloud is the conversion.

---

*This document is a working brainstorm, not a commitment. Architecture and commercialisation model TBD.*
