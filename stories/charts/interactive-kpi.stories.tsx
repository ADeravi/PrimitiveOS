import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ChartBrush,
  ChartBullet,
  ChartCandlestick,
  ChartGauge,
  ChartSparkline,
} from "@/components/charts";

const meta: Meta = {
  title: "Charts/Interactive/KPI & Time",
  parameters: {
    layout: "centered",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Importable single-value and time-series chart components from `@/components/charts`: gauge with functional-token status colouring, bullet with movable targets, switchable sparkline stat cards, brush-zoom with smoothing, and candlestick with adjustable session count.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const GaugeStory: Story = { name: "Gauge", render: () => <ChartGauge /> };
export const BulletStory: Story = { name: "Bullet", render: () => <ChartBullet /> };
export const SparklineStory: Story = { name: "Sparkline", render: () => <ChartSparkline /> };
export const BrushStory: Story = { name: "Brush & Zoom", render: () => <ChartBrush /> };
export const CandlestickStory: Story = { name: "Candlestick (OHLC)", render: () => <ChartCandlestick /> };

export const SparklineMetricInteraction: Story = {
  name: "Interaction: sparkline metric",
  render: () => <ChartSparkline />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "errors" }));
    await expect(canvas.getByText("Errors")).toBeVisible();
  },
};
