import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ChartBeeswarm,
  ChartBoxPlot,
  ChartDumbbell,
  ChartHistogram,
  ChartViolin,
  ChartWaffle,
} from "@/components/charts";

const meta: Meta = {
  title: "Charts/Interactive/Distributions",
  parameters: {
    layout: "centered",
    chromatic: { delay: 1800 },
    docs: {
      description: {
        component:
          "Importable statistical chart components from `@/components/charts`: histogram with live binning, box plots with toggleable groups, violin with bandwidth control, beeswarm with point sizing, waffle with adjustable split and a sortable dumbbell.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const HistogramStory: Story = { name: "Histogram", render: () => <ChartHistogram /> };
export const BoxPlotStory: Story = { name: "Box Plot", render: () => <ChartBoxPlot /> };
export const ViolinStory: Story = { name: "Violin", render: () => <ChartViolin /> };
export const BeeswarmStory: Story = { name: "Beeswarm", render: () => <ChartBeeswarm /> };
export const WaffleStory: Story = { name: "Waffle", render: () => <ChartWaffle /> };
export const DumbbellStory: Story = { name: "Dumbbell", render: () => <ChartDumbbell /> };

export const HistogramSampleInteraction: Story = {
  name: "Interaction: histogram sample",
  render: () => <ChartHistogram />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const beta = canvas.getByRole("button", { name: "Beta" });
    await userEvent.click(beta);
    await expect(beta).toHaveAttribute("aria-pressed", "true");
  },
};
