import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

// Living documentation: the policies the Diagram guardrails enforce, rendered
// from DS tokens so they re-theme with the Design Layer. The canonical source
// is DIAGRAM-QUALITY.md / GUARDRAIL-COMPONENTS.md.

const wrap: React.CSSProperties = { maxWidth: 760, color: "var(--foreground)", fontFamily: "var(--font-sans, inherit)", lineHeight: 1.55, fontSize: 14 };
const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, margin: "0 0 4px" };
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: "22px 0 6px" };
const lead: React.CSSProperties = { color: "var(--muted-foreground)", margin: "0 0 8px" };
const code: React.CSSProperties = { fontFamily: "var(--font-mono, ui-monospace, monospace)", background: "var(--muted)", padding: "1px 5px", borderRadius: 4, fontSize: 12.5 };
const card: React.CSSProperties = { border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", background: "var(--card, var(--background))" };

const METRICS: [string, string, string, string][] = [
  ["nodeOverlap", "nodes on top of each other", "any → warn · >5% → error", "separateOverlaps"],
  ["labelOverlap", "labels colliding", "any → warn", "thinLabels (top-N by degree)"],
  ["edgeCrossings", "hairball clutter", ">10% → warn · >30% → error", "suggestIdiom (→ hierarchy/matrix)"],
  ["paletteOverflow", "> 6 categorical colours", "over cap → error", "clampPalette (merge tail → Other)"],
  ["legibility", "text too small to read", "< 5px → warn", "hideLabelsBelowZoom"],
  ["aspect", "extreme stretch", "<1:3 or >3:1 → warn", "refit"],
];

const RULES = [
  ["Accepts meaning, not form", "Props are data + intent. No style/position/colour/layout-knob prop that could violate an invariant."],
  ["Bad input won't type-check", "Enums, capped numbers, discriminated unions — misuse fails at compile time, not render."],
  ["Enforces its own invariants", "Runs the checks and auto-corrections internally; whatever it emits is already valid."],
  ["Principled defaults", "The readable outcome is the default with zero config; deviating needs a deliberate, named opt-out."],
  ["Degrades and discloses", "When it can't fully comply it shows the best view and surfaces why — honesty over a pretty lie."],
  ["One loud escape hatch", "A single, obviously-named unsafe/raw prop for genuine edge cases, that warns when used."],
];

function Quality() {
  return (
    <article style={wrap}>
      <h1 style={h1}>Diagram quality — the god layer</h1>
      <p style={lead}>The deterministic gate between AI/MCP output and the canvas. No layout engine produces a <em>readable</em> diagram on its own — it only produces positions. This layer scores the result and repairs it.</p>
      <div style={card}>
        <strong>The one rule:</strong> the AI proposes <em>meaning</em> (<span style={code}>nodes, edges, intent, provenance</span>); the application disposes <em>form</em>. Styling and positions never cross the AI boundary.
      </div>

      <h2 style={h2}>The pipeline</h2>
      <p>① schema gate (reject styling/position) → ② idiom picker (intent + data-shape → one contract) → ③ principled defaults → ④ layout → <strong>⑤ validate</strong> (score + corrections) → ⑥ auto-correct loop → canvas. The AI never touches ④–⑥.</p>

      <h2 style={h2}>What the linter measures</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--muted-foreground)" }}>
            <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Metric</th>
            <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Catches</th>
            <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Threshold</th>
            <th style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Correction</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map(([a, b, c, d]) => (
            <tr key={a}>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}><span style={code}>{a}</span></td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>{b}</td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>{c}</td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}><span style={code}>{d}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={h2}>Contract rules (what geometry can't see)</h2>
      <ul>
        <li><strong>Force</strong> — must offer community grouping; no accent colour in exploratory use.</li>
        <li><strong>Similarity</strong> — position is the relation; don't draw the full edge set.</li>
        <li><strong>Timeline</strong> — undated items sit off-axis with a count, never on the axis.</li>
        <li><strong>One positional contract per frame</strong> — never mix two position encodings.</li>
      </ul>
    </article>
  );
}

function GuardrailComponents() {
  return (
    <article style={wrap}>
      <h1 style={h1}>Guardrail components</h1>
      <p style={lead}>A component where using it correctly is the only way to use it. The policy isn't a doc you must remember or a linter that scolds you after — it's baked into the API and internals, so a bad result is <em>unrepresentable</em>.</p>
      <div style={card}><strong>The principle:</strong> make illegal states unrepresentable. The good outcome is the default; the bad outcome can't be expressed.</div>

      <h2 style={h2}>The contract — six rules</h2>
      <ol>
        {RULES.map(([t, d]) => (
          <li key={t} style={{ marginBottom: 6 }}><strong>{t}.</strong> {d}</li>
        ))}
      </ol>

      <h2 style={h2}>Example</h2>
      <p><span style={code}>&lt;Diagram intent nodes edges /&gt;</span> has no position/style prop, so a bad layout can't be passed in; it runs the pipeline internally and discloses when it simplifies. See <strong>Diagram › Overview</strong> and <strong>Diagram › Linter</strong>.</p>
    </article>
  );
}

const CANON: { t: string; lead: string; rule: string; src: string }[] = [
  {
    t: "1 · Enclosure is a membership claim",
    lead: "We read enclosed — or merely close — objects as one group, automatically. So accidental proximity lies: unrelated things placed near each other read as related.",
    rule: "An enclosure must contain every member and never overlap another group's region; groups are placed as disjoint units, placement within a group is free. Linter: accidental cross-group adjacency = error; weak separation = enclose/separate.",
    src: "Knaflic, Storytelling with Data p.77 · Berengueres, Intro to DataViz (enclosure) · Healy, Data Visualization p.22",
  },
  {
    t: "2 · Colour means relationship, used sparingly + legibly",
    lead: "Colour is powerful because it's rare and intentional. Too much variety and nothing stands out; a coloured label should visibly govern the objects it describes.",
    rule: "Adaptive: minimal when simple (neutral + one accent), rich when complex (role + group + importance). A group's hue is shared across enclosure, label and a member cue, contrast-checked (never hue-on-hue). Categorical colour is capped so palettes never recycle.",
    src: "Knaflic, Storytelling with Data p.133–134 (use sparingly, intentional, contrast, heatmap-by-saturation) · Kirk, Handbook Ch.9",
  },
  {
    t: "3 · Edge clarity comes from arrangement, not styling",
    lead: "A long, many-cornered edge is a symptom of placement. Clutter is cognitive load; you remove it by arranging, not decorating.",
    rule: "Minimise edge length, bends and crossings by node placement (related nodes adjacent); align elements and keep white space; reserve dashed lines for genuine uncertainty. Measure length/bends/crossings and re-arrange — don't restyle.",
    src: "Knaflic, Storytelling with Data Ch.3 (clutter, alignment & white space, p.98) · Kirk, Handbook Ch.10 (Composition)",
  },
];

function Canon() {
  return (
    <article style={wrap}>
      <h1 style={h1}>Policies, grounded in the canon</h1>
      <p style={lead}>These aren&apos;t invented. Each policy is drawn from the data-visualisation literature in the project library and restated as a rule the engine and linter enforce. The through-line: <em>the drawing must make the relationships true</em> — proximity = relatedness, enclosure = membership, colour = which-set, and clutter is removed by arrangement, not decoration. Full text + citations in <span style={code}>components/diagram/POLICIES.md</span>.</p>
      {CANON.map((c) => (
        <div key={c.t} style={{ ...card, marginBottom: 14 }}>
          <strong style={{ fontSize: 15 }}>{c.t}</strong>
          <p style={{ ...lead, margin: "6px 0" }}>{c.lead}</p>
          <p style={{ margin: "6px 0" }}><strong>Enforced:</strong> {c.rule}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>Sources: {c.src}</p>
        </div>
      ))}
    </article>
  );
}

const meta: Meta = {
  title: "Diagram/Policies",
  parameters: { layout: "padded" },
};
export default meta;
type S = StoryObj;

export const Canon_: S = { name: "Grounded in the canon", render: () => <Canon /> };
export const Quality_: S = { name: "Quality (the god layer)", render: () => <Quality /> };
export const GuardrailContract: S = { name: "Guardrail components", render: () => <GuardrailComponents /> };
