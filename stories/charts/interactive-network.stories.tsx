import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ChartNetwork } from "@/components/charts";

const meta: Meta = {
  title: "Charts/Interactive/Network",
  parameters: {
    layout: "centered",
    chromatic: { delay: 2000 },
    docs: {
      description: {
        component:
          "An interactive node-link graph (Cytoscape.js, MIT) wired with a full control panel — the same model as the other interactive charts. Switch layouts (force / hierarchy / circle / concentric / grid), tune the force physics (gravity, link distance), size nodes by degree, toggle labels and arrows, threshold by min-degree, and Fit/Reset. Hover a node for its degree; click a node to isolate its neighbourhood. Node colours map groups to the --chart-* tokens and edges use --border, so the graph re-themes with the Design Layer and dark mode.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const NetworkStory: Story = { name: "Network", render: () => <ChartNetwork /> };

export const LayoutInteraction: Story = {
  name: "Interaction: switch layout",
  render: () => <ChartNetwork />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hierarchy = canvas.getByRole("button", { name: "hierarchy" });
    await userEvent.click(hierarchy);
    await expect(hierarchy).toHaveAttribute("aria-pressed", "true");
    const grid = canvas.getByRole("button", { name: "grid" });
    await userEvent.click(grid);
    await expect(grid).toHaveAttribute("aria-pressed", "true");
  },
};
