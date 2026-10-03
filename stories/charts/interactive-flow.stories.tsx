import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ChartFunnel,
  ChartSankey,
  ChartStreamgraph,
  ChartSunburst,
  ChartTreemap,
  ChartWaterfall,
} from "@/components/charts";

const meta: Meta = {
  title: "Charts/Interactive/Flow & Hierarchy",
  parameters: {
    layout: "centered",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Importable flow and part-to-whole chart components from `@/components/charts`: treemap with small-tile merging, sankey with layout controls, funnel with conversion labels, waterfall with period switching, streamgraph with selectable baselines and a sunburst with group focus.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const TreemapStory: Story = { name: "Treemap", render: () => <ChartTreemap /> };
export const SankeyStory: Story = { name: "Sankey (Flow)", render: () => <ChartSankey /> };
export const FunnelStory: Story = { name: "Funnel", render: () => <ChartFunnel /> };
export const WaterfallStory: Story = { name: "Waterfall", render: () => <ChartWaterfall /> };
export const StreamgraphStory: Story = { name: "Streamgraph", render: () => <ChartStreamgraph /> };
export const SunburstStory: Story = { name: "Sunburst", render: () => <ChartSunburst /> };

export const FunnelStagesInteraction: Story = {
  name: "Interaction: funnel stages",
  render: () => <ChartFunnel />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const three = canvas.getByRole("button", { name: "3" });
    await userEvent.click(three);
    await expect(three).toHaveAttribute("aria-pressed", "true");
  },
};
