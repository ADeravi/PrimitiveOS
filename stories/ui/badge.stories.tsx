import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Info, XCircle, ArrowUpRight } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A small status descriptor. Use brand variants for categorisation and the functional variants (`success`, `warning`, `info`, `destructive`) for state communication.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "success", "warning", "info", "outline", "ghost", "link"],
      table: { defaultValue: { summary: "default" } },
    },
    asChild: { control: false },
  },
  args: { children: "Badge", variant: "default" },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const Functional: Story = {
  name: "Functional (status)",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success"><CheckCircle2 /> Success</Badge>
      <Badge variant="warning"><AlertTriangle /> Warning</Badge>
      <Badge variant="info"><Info /> Info</Badge>
      <Badge variant="destructive"><XCircle /> Failed</Badge>
    </div>
  ),
};

export const UseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm">
        Deployment <Badge variant="success">Live</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        Certificate <Badge variant="warning">Expires in 7 days</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        Plan <Badge>Pro</Badge> <Badge variant="outline">v2.4.0</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        As link
        <Badge asChild variant="info">
          <a href="#">Release notes <ArrowUpRight /></a>
        </Badge>
      </div>
    </div>
  ),
};
