// scripts/build-lib.mjs — build the consumable COMPONENT library into dist/.
//
// The logic barrels (scntw-ds/charts, scntw-ds/diagram) ship as source and need
// no build. The React components use the "@/" path alias, so a consumer's bundler
// can't resolve them from source — this build pre-resolves "@/" (via tsconfig
// paths), externalizes every npm dependency (they install alongside scntw-ds),
// and drops per-component CSS imports (styling comes from app/globals.css tokens,
// which consumers already import). Output: ESM.
//
//   npm run build:lib   →   dist/charts/index.js  +  dist/diagram/index.js
//
// Exposed as scntw-ds/charts/components and scntw-ds/diagram/components (see
// package.json "exports"). Rebuild + commit dist/ when the components change.

import { build } from "esbuild";

const common = {
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  packages: "external",          // react, recharts, cytoscape, d3, … stay external
  tsconfig: "tsconfig.json",      // resolves the "@/*" -> "./*" path alias
  jsx: "automatic",               // React 19 automatic runtime (react/jsx-runtime)
  loader: { ".css": "empty" },    // styling lives in the token CSS, not per-component
  logLevel: "info",
  outdir: "dist",
};

await build({ ...common, entryPoints: { "charts/index": "components/charts/index.ts" } });
await build({ ...common, entryPoints: { "diagram/index": "components/diagram/index.ts" } });

console.log("✓ built dist/charts/index.js + dist/diagram/index.js");
