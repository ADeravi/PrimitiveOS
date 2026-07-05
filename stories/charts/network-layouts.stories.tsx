import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ChartNetworkForce,
  ChartNetworkHierarchy,
  ChartNetworkCircle,
  ChartNetworkConcentric,
  ChartNetworkGrid,
} from "@/components/charts";

const meta: Meta = {
  title: "Nests/Charts/Interactive/Network Layouts",
  parameters: {
    layout: "centered",
    chromatic: { delay: 2500 },
    docs: {
      description: {
        component:
          "Each cytoscape graph layout as its own chart with settings tuned to that algorithm. Force exposes the physics (repulsion / edge length / gravity); Hierarchy exposes Dagre's direction, ranker and separations; Circle and Concentric expose angle, sweep, spacing and ordering; Grid exposes rows, columns and packing. All share the display controls — edge style, arrows, node/label size, degree filter, fit — plus hover-for-degree and click-to-isolate. Colours map groups to the --chart-* tokens, so every layout re-themes with the Design Layer.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const Force: Story = { name: "Force-directed", render: () => <ChartNetworkForce /> };
export const Hierarchy: Story = { name: "Hierarchical", render: () => <ChartNetworkHierarchy /> };
export const Circle: Story = { name: "Circle", render: () => <ChartNetworkCircle /> };
export const Concentric: Story = { name: "Concentric", render: () => <ChartNetworkConcentric /> };
export const Grid: Story = { name: "Grid", render: () => <ChartNetworkGrid /> };

export const HierarchyDirection: Story = {
  name: "Interaction: hierarchy direction",
  render: () => <ChartNetworkHierarchy />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lr = canvas.getByRole("button", { name: "Left→" });
    await userEvent.click(lr);
    await expect(lr).toHaveAttribute("aria-pressed", "true");
  },
};
