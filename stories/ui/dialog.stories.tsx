import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A modal window for focused tasks. Use for short forms and confirmations; prefer Sheet for long content and AlertDialog for destructive confirmations that must not be dismissed accidentally.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>Anyone with this link can view the document.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly defaultValue="https://scntw.design/share/8f2k1" />
          <Button type="button">Copy</Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes and click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dlg-name">Name</Label>
            <Input id="dlg-name" defaultValue="Ada Lovelace" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dlg-handle">Username</Label>
            <Input id="dlg-handle" defaultValue="@ada" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const OpenCloseInteraction: Story = {
  name: "Interaction: open & close",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open it</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hello dialog</DialogTitle>
          <DialogDescription>An accessible modal window.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Dismiss</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open it" }));
    await waitFor(async () => expect(screen.getByText("Hello dialog")).toBeVisible());
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    await waitFor(async () => expect(screen.queryByText("Hello dialog")).not.toBeInTheDocument());
  },
};

export const DestructiveConfirm: Story = {
  name: "Destructive Confirmation",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete workspace</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete workspace?</DialogTitle>
          <DialogDescription>
            This permanently deletes <span className="font-medium text-foreground">acme-prod</span> and
            all of its data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Type the workspace name to confirm</Label>
          <Input id="confirm" placeholder="acme-prod" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">I understand — delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
