import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { SPACING, TYPE, OPACITY, RADIUS, STROKE, lintPrimitives } from "@/components/foundation/primitives";

// Living documentation for the FOUNDATION primitives — Carbon-grounded spacing,
// type, shade and transparency. Source: components/diagram/PRIMITIVES-POLICY.md
// + components/foundation/primitives.ts.

const wrap: React.CSSProperties = { maxWidth: 860, color: "var(--foreground)", fontFamily: "var(--font-sans, inherit)", lineHeight: 1.55, fontSize: 14 };
const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, margin: "0 0 4px" };
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: "22px 0 8px" };
const lead: React.CSSProperties = { color: "var(--muted-foreground)", margin: "0 0 8px" };
const code: React.CSSProperties = { fontFamily: "var(--font-mono, ui-monospace, monospace)", background: "var(--muted)", padding: "1px 5px", borderRadius: 4, fontSize: 12.5 };
const card: React.CSSProperties = { border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", background: "var(--card, var(--background))", marginBottom: 14 };

function Primitives() {
  const bars = SPACING;
  const opacityRows = Object.entries(OPACITY);
  return (
    <article style={wrap}>
      <h1 style={h1}>Primitives — the foundation tier (Carbon-grounded)</h1>
      <p style={lead}>Every chart, diagram and edge draws from one small, checkable set, mapped onto our tokens so theming survives. Source: <span style={code}>components/foundation/primitives.ts</span>. The probe asserts the diagram's values stay on these scales: <span style={code}>npm run lint:policies</span>.</p>

      <div style={card}>
        <h2 style={{ ...h2, marginTop: 0 }}>Spacing — Carbon 2× scale</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
          {bars.map((px, i) => (
            <div key={px} style={{ textAlign: "center" }}>
              <div style={{ width: 22, height: Math.min(px, 96), background: "var(--color-text-info, #0072B2)", borderRadius: 3 }} />
              <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 4 }}>{i + 1}</div>
              <div style={{ fontSize: 10, color: "var(--foreground)" }}>{px}</div>
            </div>
          ))}
        </div>
        <p style={{ ...lead, margin: "8px 0 0" }}><span style={code}>sp(5)</span> = 16. "Deviating from the scale should be avoided."</p>
      </div>

      <div style={card}>
        <h2 style={{ ...h2, marginTop: 0 }}>Type — IBM Plex ramp, by role</h2>
        {Object.entries(TYPE).map(([role, t]) => (
          <div key={role} style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.line, color: "var(--foreground)", marginBottom: 2 }}>
            {role} — {t.size}px / {t.weight} <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 400 }}>The quick brown fox</span>
          </div>
        ))}
      </div>

      <div style={card}>
        <h2 style={{ ...h2, marginTop: 0 }}>Shade &amp; transparency</h2>
        <p style={lead}>Importance / selection = a darker <strong>step</strong>, never opacity. Transparency is <strong>reserved</strong> for true overlays — each value named:</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {opacityRows.map(([name, o]) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 32, borderRadius: 6, background: "var(--foreground)", opacity: o, border: "1px solid var(--border)" }} />
              <div style={{ fontSize: 10.5, marginTop: 4 }}>{name}</div>
              <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{o}</div>
            </div>
          ))}
        </div>
        <p style={{ ...lead, margin: "10px 0 0", fontSize: 12.5 }}>Radius <span style={code}>{Object.values(RADIUS).join(" / ")}</span> · stroke <span style={code}>{Object.values(STROKE).join(" / ")}</span> (on the 2× grid).</p>
      </div>
    </article>
  );
}

function Linter() {
  const good = lintPrimitives({ spacing: [16, 24, 64], typeSize: [12, 14, 16], opacity: [1, 0.8, 0.18] });
  const bad = lintPrimitives({ spacing: [20, 38], typeSize: [13, 11], opacity: [0.78, 0.95] });
  const row = (label: string, r: ReturnType<typeof lintPrimitives>) => (
    <div style={{ ...card }}>
      <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700 }}>{label} → {r.pass ? "✓ on scale" : `✗ ${r.violations.length} off`}</div>
      <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
        {r.violations.length === 0 && <li style={{ color: "var(--muted-foreground)" }}>nothing off the scales.</li>}
        {r.violations.map((v, i) => <li key={i}><span style={{ color: "var(--destructive, #c0392b)" }}>[{v.kind}]</span> {v.detail}</li>)}
      </ul>
    </div>
  );
  return (
    <article style={wrap}>
      <h1 style={h1}>The primitives linter, exposed</h1>
      <p style={lead}><span style={code}>lintPrimitives</span> flags off-scale spacing, off-ramp type, and transparency used as shade. The old magic numbers (<span style={code}>20</span>, <span style={code}>13px</span>, <span style={code}>0.78</span>) are exactly what it catches.</p>
      {row("on-scale values", good)}
      {row("magic numbers", bad)}
    </article>
  );
}

const meta: Meta = { title: "Nests/Diagrams/Primitives", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

export const Primitives_: S = { name: "Primitives (the scales)", render: () => <Primitives /> };
export const Linter_: S = { name: "Linter (on-scale vs magic numbers)", render: () => <Linter /> };
