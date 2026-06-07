# Changelog

All notable changes to the ScnTw Design System. Versioning follows semver;
releases are tagged automatically when `package.json` version changes on main.

## 1.0.0 — 2026-06-07

First stable release.

### Tokens

- 3-tier token architecture: Tier 1 primitive ladders (neutral, blue, green, red, amber — 50→950, oklch), Tier 2 semantic tokens, Tier 3 functional tokens (`--success`, `--warning`, `--info` + foregrounds) with light/dark variants.
- Primitive ladders intentionally not mapped to Tailwind `--color-*` utilities, so the built-in colour scales stay untouched.
- Elevation (`--shadow-2xs…xl`) and motion (`--duration-*`, `--ease-*`) token sets.
- `npm run tokens` exports the full system to `tokens.json` (W3C Design Tokens format) for Figma Tokens / Tokens Studio.

### Components

- Full shadcn/ui set restyled on the token system, plus Badge/Alert functional variants.
- Composite inputs: Combobox, MultiSelect, TagInput, DateRangePicker, Rating, PasswordInput, Dropzone.
- Structure & navigation: Stepper, TreeView, Timeline, EmptyState, Kbd.
- Chart toolkit (`@/components/charts`): 25 importable interactive charts across Core, Flow & Hierarchy, KPI & Time and Distributions families — each with live controls, PNG/SVG/CSV export, accessible figure labels and token theming.
- Chart support components: ChartCard, ChartControls, ChartSkeleton, ChartEmpty, ChartError, SegmentedControl, FilterPill.

### Storybook

- Branded manager + docs theme, Introduction page, foundation pages (Color, Typography, Spacing, Elevation, Radius, Motion).
- Design Layer toolbar: shadcn / Material 3 / Fluent 2 / Carbon / Apple HIG / Expressive presets, plus radius, primary and density overrides.
- Charts category: 7 galleries (Overview, Flow & Hierarchy, KPI & Time, Distributions, Maps, Network Graphs ×22 layouts, Graph Idioms), interactive component pages, a cross-filtered Linked Dashboard, chart states and a "Choosing a Chart" guide.
- Patterns: Dashboard, Login, Settings, Data Table.
- Interaction tests (play functions) across inputs, structure components and charts.

### CI

- Deploy to GitHub Pages + Chromatic on every push to main.
- `quality` job (tsc + eslint), `interaction-tests` job (Storybook test-runner), auto-release workflow.
