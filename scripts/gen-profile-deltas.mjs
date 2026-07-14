/**
 * scripts/gen-profile-deltas.mjs — regenerate app/tokenos/profile-deltas.json from TokenOS.
 *
 *   npm run tokens:profiles            regenerate
 *   npm run tokens:profiles -- --check verify only; exits 1 on drift (CI)
 *
 * WHY (TOKENOS-INTEGRATION-PLAN.md F3):
 * `.storybook/preview.tsx` imports profile-deltas.json to drive profile switching. The file is TokenOS-derived —
 * its own header said "from `tokenos build --profile <name>` … Regenerate when profiles/axes change" — but that
 * was an ad-hoc manual run, and `sync:tokenos` never covered it. So it drifted silently: it carried 6 profiles
 * while TokenOS's tokens/profiles.json had 8 (`atlassian` and `polaris` were simply missing), and it was being
 * hand-edited. This makes it generated, and gates it.
 *
 * HOW: for each profile, build TokenOS with TOKENOS_PROFILE into a TEMP dir (never TokenOS's own
 * platform-outputs — a non-base build left there poisons other checks; that was BL-47), parse the resolved light
 * `:root` of web/tokens-light.css, and record every var that differs from the default build. The profile list is
 * read FROM TokenOS, never hardcoded — that omission is what let atlassian/polaris go missing.
 */
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENOS = process.env.TOKENOS_ROOT ? resolve(process.env.TOKENOS_ROOT) : resolve(ROOT, "../../Projects/TokenOS");
const OUT = join(ROOT, "app/tokenos/profile-deltas.json");
const check = process.argv.includes("--check");

if (!existsSync(join(TOKENOS, "packages/core/index.mjs"))) {
  console.error(`✗ TokenOS not found at ${TOKENOS} — set TOKENOS_ROOT.`);
  process.exit(1);
}

// The profile list comes FROM TokenOS. Hardcoding it is what let atlassian/polaris silently go missing.
const profilesPath = join(TOKENOS, "tokens/profiles.json");
if (!existsSync(profilesPath)) { console.error(`✗ ${profilesPath} not found`); process.exit(1); }
const profiles = Object.keys(JSON.parse(readFileSync(profilesPath, "utf8"))).filter((k) => !k.startsWith("$")).sort();

/** Build TokenOS (optionally under a profile) into a temp dir and return its resolved light `:root` vars. */
function rootVars(profile, tmp) {
  const dir = join(tmp, profile ?? "__default__");
  const r = spawnSync(process.execPath, [join(TOKENOS, "packages/core/index.mjs")], {
    cwd: TOKENOS,
    env: { ...process.env, TOKENOS_OUTPUT_DIR: dir, ...(profile ? { TOKENOS_PROFILE: profile } : {}) },
    stdio: "ignore",
  });
  if (r.status !== 0) throw new Error(`TokenOS build failed for profile=${profile ?? "(default)"} (exit ${r.status})`);
  const css = readFileSync(join(dir, "web/tokens-light.css"), "utf8");
  const i = css.indexOf(":root {");
  if (i === -1) throw new Error(`no :root block in the ${profile ?? "default"} build`);
  const body = css.slice(i, css.indexOf("\n}", i));
  return Object.fromEntries([...body.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]));
}

const tmp = mkdtempSync(join(tmpdir(), "scntw-profiles-"));
let next;
try {
  const base = rootVars(null, tmp);
  const deltas = {};
  for (const p of profiles) {
    const vars = rootVars(p, tmp);
    const d = {};
    for (const [k, v] of Object.entries(vars)) if (base[k] !== v) d[k] = v;
    deltas[p] = d;
    if (!check) console.log(`  ${p.padEnd(10)} ${String(Object.keys(d).length).padStart(3)} var(s) differ from default`);
  }
  next = {
    $generated:
      "Generated from TokenOS by scripts/gen-profile-deltas.mjs (`npm run tokens:profiles`) — real engine deltas " +
      "vs the default build, resolved light :root. Do not edit by hand; regenerate when TokenOS profiles/axes change.",
    ...deltas,
  };
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const serialized = JSON.stringify(next, null, 2) + "\n";
const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;

if (check) {
  if (serialized !== current) {
    console.error("✗ app/tokenos/profile-deltas.json is STALE — regenerate with `npm run tokens:profiles`.");
    process.exit(1);
  }
  console.log(`✓ profile-deltas.json is up to date (${profiles.length} profiles: ${profiles.join(", ")})`);
} else {
  writeFileSync(OUT, serialized);
  console.log(serialized === current ? "✓ profile-deltas.json already up to date" : "↻ profile-deltas.json regenerated");
  console.log(`  ${profiles.length} profiles from TokenOS tokens/profiles.json: ${profiles.join(", ")}`);
}
