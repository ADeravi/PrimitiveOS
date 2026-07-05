import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const meta: Meta = { title: "Nests/Overlays/Tooltip", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
      <TooltipContent><p>Add to library</p></TooltipContent>
    </Tooltip>
  ),
};
