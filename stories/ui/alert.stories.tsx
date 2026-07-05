import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info, AlertCircle, Terminal } from "lucide-react";

const meta: Meta<typeof Alert> = {
  title: "Nests/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An inline callout for contextual feedback. Functional variants map to the Tier 3 status tokens: `success`, `warning`, `info` and `destructive`.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "success", "warning", "info"],
      table: { defaultValue: { summary: "default" } },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <Terminal />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

export const Functional: Story = {
  name: "Functional (status)",
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <Alert variant="success">
        <CheckCircle2 />
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>Your profile was updated successfully.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTriangle />
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>You have used 92% of your plan. Upgrade to avoid interruptions.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info />
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>The API will be read-only on Sunday from 02:00–04:00 UTC.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined. Update your billing details to retry.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <Alert variant="info" className="max-w-md">
      <Info />
      <AlertTitle>A new version is available — refresh to update.</AlertTitle>
    </Alert>
  ),
};
