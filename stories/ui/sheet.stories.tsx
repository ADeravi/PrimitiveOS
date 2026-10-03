import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const meta: Meta = { title: "UI/Sheet", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Open right</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>Edit profile</SheetTitle><SheetDescription>Make changes to your profile here.</SheetDescription></SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Open left</Button></SheetTrigger>
      <SheetContent side="left">
        <SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
