"use client";
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { FolderSearch, Plus } from "lucide-react";

import { Stepper } from "@/components/ui/stepper";
import { TreeView, type TreeNode } from "@/components/ui/tree-view";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";

const meta: Meta = {
  title: "UI/Structure",
  parameters: {
    docs: {
      description: {
        component:
          "Structural and navigational components: stepper/wizard, tree view, timeline, empty state and kbd — composed from the token system.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

const STEPS = [
  { id: "account", title: "Account", description: "Your details" },
  { id: "workspace", title: "Workspace", description: "Name & region" },
  { id: "invite", title: "Invite", description: "Add your team" },
  { id: "done", title: "Finish", description: "Review" },
];

function StepperDemo() {
  const [step, setStep] = React.useState(1);
  return (
    <div className="w-[480px] space-y-6">
      <Stepper steps={STEPS} current={step} onStepClick={setStep} />
      <div className="flex justify-between">
        <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export const StepperStory: Story = {
  name: "Stepper",
  render: () => <StepperDemo />,
};

const TREE: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button", label: "button.tsx" },
          { id: "card", label: "card.tsx" },
        ],
      },
      { id: "index", label: "index.ts" },
    ],
  },
  { id: "package", label: "package.json" },
  { id: "readme", label: "README.md" },
];

export const TreeViewStory: Story = {
  name: "Tree View",
  render: () => <TreeView data={TREE} defaultExpanded={["src"]} />,
};

export const TimelineStory: Story = {
  name: "Timeline",
  render: () => (
    <Timeline className="w-80">
      <TimelineItem title="Deploy succeeded" time="2 min ago" status="success">
        v2.4.1 went live to production.
      </TimelineItem>
      <TimelineItem title="Certificate renewal due" time="1 h ago" status="warning">
        api.example.com expires in 7 days.
      </TimelineItem>
      <TimelineItem title="Maintenance scheduled" time="3 h ago" status="info">
        Read-only window on Sunday 02:00 UTC.
      </TimelineItem>
      <TimelineItem title="Build failed" time="Yesterday" status="destructive">
        Type error in charts.stories.tsx.
      </TimelineItem>
      <TimelineItem title="Project created" time="Jun 1" status="muted" />
    </Timeline>
  ),
};

export const EmptyStateStory: Story = {
  name: "Empty State",
  render: () => (
    <div className="w-96">
      <EmptyState
        icon={<FolderSearch />}
        title="No projects yet"
        description="Projects you create will show up here. Start by creating your first one."
      >
        <Button size="sm">
          <Plus /> New project
        </Button>
        <Button size="sm" variant="outline">
          Import
        </Button>
      </EmptyState>
    </div>
  ),
};

export const KbdStory: Story = {
  name: "Kbd",
  render: () => (
    <p className="text-sm text-muted-foreground">
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette, or <Kbd>⇧</Kbd> <Kbd>?</Kbd> for help.
    </p>
  ),
};

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------
export const StepperInteraction: Story = {
  name: "Interaction: stepper advances",
  render: () => <StepperDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByText("Invite").closest("button")).toHaveAttribute("aria-current", "step");
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await expect(canvas.getByText("Workspace").closest("button")).toHaveAttribute("aria-current", "step");
  },
};

export const TreeViewInteraction: Story = {
  name: "Interaction: tree expands & selects",
  render: () => <TreeView data={TREE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("src"));
    await userEvent.click(canvas.getByText("components"));
    await userEvent.click(canvas.getByText("button.tsx"));
    await expect(canvas.getByText("button.tsx").closest("li")).toHaveAttribute("aria-selected", "true");
  },
};
