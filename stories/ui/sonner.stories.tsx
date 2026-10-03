import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const meta: Meta = { title: "UI/Sonner", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

const ToastDemo = ({ variant }: { variant: string }) => {
  const fire = () => {
    if (variant === "success") toast.success("Event has been created");
    else if (variant === "error") toast.error("Event has not been created");
    else if (variant === "warning") toast.warning("Event has been modified");
    else if (variant === "info") toast.info("Be at the area 10 minutes before.");
    else toast("Event has been created", { description: "Sunday, December 03, 2023 at 9:00 AM" });
  };
  return (
    <>
      <Toaster />
      <Button variant="outline" onClick={fire}>Show {variant} toast</Button>
    </>
  );
};

export const Default: Story = { render: () => <ToastDemo variant="default" /> };
export const Success: Story = { render: () => <ToastDemo variant="success" /> };
export const Error: Story = { render: () => <ToastDemo variant="error" /> };
export const Warning: Story = { render: () => <ToastDemo variant="warning" /> };
export const Info: Story = { render: () => <ToastDemo variant="info" /> };
