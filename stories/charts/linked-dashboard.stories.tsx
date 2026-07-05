"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { FilterPill } from "@/components/ui/filter-pill";

const meta: Meta = {
  title: "Nests/Charts/Interactive/Linked Dashboard",
  parameters: {
    layout: "fullscreen",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Cross-chart interaction: click a region bar to filter every other panel (cross-filtering / drill-down), and hover either time-series — they share a crosshair via recharts syncId (linked brushing).",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const TOKEN = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const REGIONS = ["AMER", "EMEA", "APAC", "LATAM", "MEA"] as const;
type Region = (typeof REGIONS)[number];

// Deterministic per-region monthly series
const det = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const SERIES = Object.fromEntries(
  REGIONS.map((r, ri) => [
    r,
    Array.from({ length: 12 }, (_, i) => ({
      month: MONTH_NAMES[i],
      sessions: Math.round(200 + (5 - ri) * 90 + 70 * Math.sin(i / 1.9 + ri) + i * (8 - ri)),
      revenue: Math.round(20 + (5 - ri) * 11 + 9 * Math.sin(i / 1.6 + ri * 2) + i * 1.4),
    })),
  ])
) as Record<Region, { month: string; sessions: number; revenue: number }[]>;

const totals = REGIONS.map((r, ri) => ({
  region: r,
  revenue: SERIES[r].reduce((a, d) => a + d.revenue, 0),
  fill: TOKEN[ri % 5],
}));

function sumSeries() {
  return Array.from({ length: 12 }, (_, i) => ({
    month: MONTH_NAMES[i],
    sessions: REGIONS.reduce((a, r) => a + SERIES[r][i].sessions, 0),
    revenue: REGIONS.reduce((a, r) => a + SERIES[r][i].revenue, 0),
  }));
}

const sessionsConfig = { sessions: { label: "Sessions", color: "var(--chart-2)" } } satisfies ChartConfig;
const revenueConfig = { revenue: { label: "Revenue ($k)", color: "var(--chart-1)" } } satisfies ChartConfig;
const regionConfig = { revenue: { label: "Revenue ($k)", color: "var(--chart-1)" } } satisfies ChartConfig;

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function LinkedDashboard() {
  const [region, setRegion] = React.useState<Region | null>(null);
  const rows = region ? SERIES[region] : sumSeries();
  const scope = region ?? "All regions";
  const kpiRevenue = rows.reduce((a, d) => a + d.revenue, 0);
  const kpiSessions = rows.reduce((a, d) => a + d.sessions, 0);
  // det() keeps the conversion figure stable per scope.
  const conversion = (1.8 + det(scope.length, 7) * 1.6).toFixed(1);
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Linked Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Click a bar to cross-filter every panel. Hover either time-series — the crosshair is shared.
            </p>
          </div>
          <span className="flex items-center gap-2">
            <span data-testid="scope" className="text-sm font-medium text-foreground">{scope}</span>
            {region && <FilterPill label="Clear filter" active onClick={() => setRegion(null)} />}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Revenue", value: `$${kpiRevenue}k` },
            { label: "Sessions", value: kpiSessions.toLocaleString() },
            { label: "Conversion", value: `${conversion}%` },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">{k.label} · {scope}</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel title="Revenue by region" description="Click a bar to drill into one region.">
            <ChartContainer config={regionConfig} className="h-56 w-full">
              <BarChart data={totals} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="region" type="category" tickLine={false} axisLine={false} width={56} />
                <XAxis type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar
                  dataKey="revenue"
                  radius={4}
                  className="cursor-pointer"
                  onClick={(d: { region?: Region }) => {
                    if (d?.region) setRegion((r) => (r === d.region ? null : (d.region as Region)));
                  }}
                >
                  {totals.map((t) => (
                    <Cell key={t.region} fill={t.fill} opacity={region === null || region === t.region ? 1 : 0.25} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </Panel>

          <Panel title="Share of total" description="The filtered region against the rest.">
            <div className="flex h-56 flex-col justify-center gap-3">
              {totals.map((t) => {
                const max = Math.max(...totals.map((x) => x.revenue));
                const dim = region !== null && region !== t.region;
                return (
                  <button
                    key={t.region}
                    type="button"
                    onClick={() => setRegion((r) => (r === t.region ? null : t.region))}
                    className="group flex items-center gap-2 text-left"
                  >
                    <span className="w-12 text-xs text-muted-foreground">{t.region}</span>
                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full transition-all"
                        style={{
                          width: `${(t.revenue / max) * 100}%`,
                          background: t.fill,
                          opacity: dim ? 0.25 : 1,
                          transitionDuration: "var(--duration-normal)",
                        }}
                      />
                    </span>
                    <span className="w-12 text-right font-mono text-xs text-muted-foreground">${t.revenue}k</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title={`Sessions · ${scope}`} description="Hover to see the shared crosshair below.">
            <ChartContainer config={sessionsConfig} className="h-56 w-full">
              <LineChart data={rows} syncId="linked" margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={42} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="sessions" type="monotone" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </Panel>

          <Panel title={`Revenue · ${scope}`} description="Synced with the sessions chart via syncId.">
            <ChartContainer config={revenueConfig} className="h-56 w-full">
              <AreaChart data={rows} syncId="linked" margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="revenue" type="monotone" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.25} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export const LinkedDashboardStory: Story = {
  name: "Linked Dashboard",
  render: () => <LinkedDashboard />,
};

export const CrossFilterInteraction: Story = {
  name: "Interaction: cross-filter",
  render: () => <LinkedDashboard />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /APAC/ }));
    await expect(canvas.getByTestId("scope")).toHaveTextContent("APAC");
    await userEvent.click(canvas.getByRole("button", { name: "Clear filter" }));
    await expect(canvas.getByTestId("scope")).toHaveTextContent("All regions");
  },
};
