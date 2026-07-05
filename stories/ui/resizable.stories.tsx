import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const meta: Meta = { title: "Nests/Layout/Resizable", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}><div className="flex h-48 items-center justify-center p-6"><span className="font-semibold">One</span></div></ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}><div className="flex h-48 items-center justify-center p-6"><span className="font-semibold">Two</span></div></ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="max-w-md rounded-lg border" style={{ height: 300 }}>
      <ResizablePanel defaultSize={50}><div className="flex h-full items-center justify-center p-6"><span className="font-semibold">Top</span></div></ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}><div className="flex h-full items-center justify-center p-6"><span className="font-semibold">Bottom</span></div></ResizablePanel>
    </ResizablePanelGroup>
  ),
};
