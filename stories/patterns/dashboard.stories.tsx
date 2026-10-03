"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

const meta: Meta = {
  title: "Patterns/Dashboard",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "An analytics overview composing stat cards, a themed chart, and a recent-activity table. The chart series use --chart-* tokens, so the whole page re-skins with the Design Layer.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const STATS = [
  { label: "Total revenue", value: "$45,231.89", delta: "+20.1%", up: true },
  { label: "Subscriptions", value: "2,350", delta: "+18.2%", up: true },
  { label: "Active now", value: "573", delta: "+4.9%", up: true },
  { label: "Churn rate", value: "2.4%", delta: "+0.3%", up: false },
];

const CHART_DATA = [
  { month: "Jan", revenue: 3200, expenses: 2100 },
  { month: "Feb", revenue: 4100, expenses: 2400 },
  { month: "Mar", revenue: 3800, expenses: 2200 },
  { month: "Apr", revenue: 5200, expenses: 2900 },
  { month: "May", revenue: 4900, expenses: 2700 },
  { month: "Jun", revenue: 6300, expenses: 3100 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig;

const ORDERS = [
  { id: "#3210", customer: "Olivia Martin", status: "Paid", amount: "$1,999.00" },
  { id: "#3209", customer: "Jackson Lee", status: "Pending", amount: "$39.00" },
  { id: "#3208", customer: "Isabella Nguyen", status: "Paid", amount: "$299.00" },
  { id: "#3207", customer: "Will Kim", status: "Failed", amount: "$99.00" },
  { id: "#3206", customer: "Sofia Davis", status: "Paid", amount: "$450.00" },
];

function statusVariant(status: string) {
  if (status === "Paid") return "success" as const;
  if (status === "Pending") return "warning" as const;
  return "destructive" as const;
}

export const Dashboard: Story = {
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview for the last 6 months.</p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue="6m">
              <TabsList>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="3m">3m</TabsTrigger>
                <TabsTrigger value="6m">6m</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline"><Download /> Export</Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={s.up ? "success" : "destructive"}>
                  {s.up ? <TrendingUp /> : <TrendingDown />} {s.delta}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs expenses</CardTitle>
            <CardDescription>Monthly totals, USD. Series colours come from the chart tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={CHART_DATA} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="expenses"
                  type="natural"
                  fill="var(--color-expenses)"
                  fillOpacity={0.2}
                  stroke="var(--color-expenses)"
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="var(--color-revenue)"
                  fillOpacity={0.3}
                  stroke="var(--color-revenue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>The five most recent transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERS.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{o.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
