import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within, expect } from "@storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta = { title: "UI/Tabs", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-96">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle><CardDescription>Make changes to your account here.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1"><Label htmlFor="name">Name</Label><Input id="name" defaultValue="Pedro Duarte" /></div>
          </CardContent>
          <CardFooter><Button>Save changes</Button></CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader><CardTitle>Password</CardTitle><CardDescription>Change your password here.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1"><Label htmlFor="current">Current password</Label><Input id="current" type="password" /></div>
          </CardContent>
          <CardFooter><Button>Save password</Button></CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const SwitchTabInteraction: Story = {
  name: "Interaction: Switch to Password tab",
  render: () => (
    <Tabs defaultValue="account" className="w-96">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account"><p className="p-4 text-sm">Account content</p></TabsContent>
      <TabsContent value="password"><p className="p-4 text-sm">Password content</p></TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordTab = canvas.getByRole("tab", { name: /password/i });
    await userEvent.click(passwordTab);
    await expect(passwordTab).toHaveAttribute("data-state", "active");
    await expect(canvas.getByText("Password content")).toBeVisible();
  },
};
