import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChartCard, ChartEmpty, ChartError, ChartSkeleton } from "@/components/charts";

const meta: Meta = {
  title: "Charts/States",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Standard non-data states for chart slots — loading skeleton, empty and error. Same footprint as a rendered chart so dashboard layouts don't jump while data loads or fails.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const Loading: Story = {
  render: () => (
    <ChartCard title="Revenue by month" description="Waiting on the data request." noExport>
      <ChartSkeleton />
    </ChartCard>
  ),
};

export const Empty: Story = {
  render: () => (
    <ChartCard title="Conversion funnel" description="Connected, but nothing recorded yet." noExport>
      <ChartEmpty
        title="No events yet"
        description="Funnel stages will appear once the first visitor lands."
        actionLabel="View setup guide"
      />
    </ChartCard>
  ),
};

export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <ChartCard title="Active users" description="The metrics endpoint returned 503." noExport>
      <ChartError onRetry={() => {}} />
    </ChartCard>
  ),
};

export const AllThree: Story = {
  name: "All Three",
  render: () => (
    <div className="flex flex-col gap-6">
      <ChartCard title="Loading" noExport><ChartSkeleton className="h-40" /></ChartCard>
      <ChartCard title="Empty" noExport><ChartEmpty className="h-40" /></ChartCard>
      <ChartCard title="Error" noExport><ChartError className="h-40" onRetry={() => {}} /></ChartCard>
    </div>
  ),
};
