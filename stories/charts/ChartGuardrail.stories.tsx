import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chart } from "@/components/charts/Chart";

// The chart guardrail: props are meaning only (intent + data + the takeaway).
// The pipeline picks the chart, enforces the policies, and discloses — a non-zero
// baseline, a 3-D pie, or a rainbow of categories can't be expressed.

const REGIONS = [
  { region: "EMEA", revenue: 4.2 }, { region: "Americas", revenue: 6.1 },
  { region: "APAC", revenue: 3.4 }, { region: "LATAM", revenue: 1.8 },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => ({ month: m, revenue: 3 + Math.sin(i) + i * 0.4 }));
const SEGMENTS = [
  { segment: "Enterprise", share: 48 }, { segment: "Mid-market", share: 28 },
  { segment: "SMB", share: 16 }, { segment: "Other", share: 8 },
];
const SCATTER = Array.from({ length: 30 }, (_, i) => ({ price: 10 + i + (i % 5) * 3, rating: 3 + (i % 7) * 0.3 }));
const MANY = Array.from({ length: 14 }, (_, i) => ({ team: "Team " + (i + 1), n: 100 - i * 6 }));

const meta: Meta<typeof Chart> = {
  title: "Charts/Guardrail",
  component: Chart,
  parameters: {
    layout: "centered",
    docs: { description: { component: "A **guardrail** chart. Props are *meaning only* — `intent`, `data`, and the takeaway `title`; never a chart type or a baseline. Internally: `pickChart` → principled defaults (zero baseline, capped colour-blind-safe palette) → `validateChart` → render, with an alternative data table on every chart. See **Charts › Policies**." } },
  },
  tags: ["autodocs"],
  args: { showGrade: true, height: 300 },
};
export default meta;
type S = StoryObj<typeof Chart>;

export const Rank: S = {
  name: "Rank (intent → bar, zero baseline)",
  args: { intent: "rank regions by revenue", title: "Americas leads revenue; LATAM trails", data: REGIONS },
};
export const Trend: S = {
  name: "Trend (intent → line)",
  args: { intent: "revenue over time", title: "Revenue has climbed steadily since January", data: MONTHS },
};
export const Share: S = {
  name: "Share, few parts (intent → pie)",
  args: { intent: "share of revenue by segment", title: "Enterprise is nearly half of revenue", data: SEGMENTS },
};
export const Relationship: S = {
  name: "Relationship (intent → scatter)",
  args: { intent: "relationship between price and rating", title: "Price and rating are weakly related", data: SCATTER },
};
export const ShareMany: S = {
  name: "Share of many (vetoed → treemap, table fallback)",
  parameters: { docs: { description: { story: "Intent is `share`, but 14 parts — the picker refuses a pie (angle isn't readable) and chooses a treemap, disclosing why. Treemap isn't rendered yet, so the honest data-table fallback shows, with the policy's choice stated." } } },
  args: { intent: "share by team", title: "Workload is spread across many teams", data: MANY },
};
