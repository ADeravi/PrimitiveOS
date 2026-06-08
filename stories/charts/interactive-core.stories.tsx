import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ChartArea,
  ChartBar,
  ChartDonut,
  ChartDualAxis,
  ChartHeatmap,
  ChartLine,
  ChartRadar,
  ChartScatter,
} from "@/components/charts";

const meta: Meta = {
  title: "Charts/Interactive/Core",
  parameters: {
    layout: "centered",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Importable interactive chart components from `@/components/charts` — each ships with live controls, an export menu (PNG / SVG / CSV), an accessible figure label and token-driven theming. `import { ChartLine } from \"@/components/charts\"`.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const LineStory: Story = { name: "Line", render: () => <ChartLine /> };
export const AreaStory: Story = { name: "Area", render: () => <ChartArea /> };
export const BarStory: Story = { name: "Bar", render: () => <ChartBar /> };
export const DonutStory: Story = { name: "Donut / Pie", render: () => <ChartDonut /> };
export const RadarStory: Story = { name: "Radar", render: () => <ChartRadar /> };
export const ScatterStory: Story = { name: "Scatter", render: () => <ChartScatter /> };
export const HeatmapStory: Story = { name: "Heatmap", render: () => <ChartHeatmap /> };
export const DualAxisStory: Story = { name: "Dual Axis", render: () => <ChartDualAxis /> };

export const LineControlsInteraction: Story = {
  name: "Interaction: line controls",
  render: () => <ChartLine />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "6M" }));
    await expect(canvas.getByRole("button", { name: "6M" })).toHaveAttribute("aria-pressed", "true");
    const mobile = canvas.getByRole("button", { name: "Mobile" });
    await userEvent.click(mobile);
    await expect(mobile).toHaveAttribute("aria-pressed", "false");
  },
};

export const BarModeInteraction: Story = {
  name: "Interaction: bar stacking",
  render: () => <ChartBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stacked = canvas.getByRole("button", { name: "stacked" });
    await userEvent.click(stacked);
    await expect(stacked).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByLabelText("Sort by value"));
  },
};
