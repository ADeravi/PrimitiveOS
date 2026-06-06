import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Switches between views within the same context. Keep labels short; use a Badge inside a trigger for counts.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-96">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Update your account details here.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Name, email and avatar settings.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Current and new password fields.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>Manage members and roles.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Invite and remove teammates.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const WithBadgesAndDisabled: Story = {
  name: "With Badges & Disabled",
  render: () => (
    <Tabs defaultValue="inbox" className="w-96">
      <TabsList>
        <TabsTrigger value="inbox">
          Inbox <Badge variant="secondary" className="ml-1">12</Badge>
        </TabsTrigger>
        <TabsTrigger value="sent">Sent</TabsTrigger>
        <TabsTrigger value="archive" disabled>Archive</TabsTrigger>
      </TabsList>
      <TabsContent value="inbox" className="text-sm text-muted-foreground p-4">
        12 unread messages.
      </TabsContent>
      <TabsContent value="sent" className="text-sm text-muted-foreground p-4">
        Sent messages.
      </TabsContent>
    </Tabs>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList className="w-full">
        <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
        <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
        <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-muted-foreground p-4">Overview panel</TabsContent>
      <TabsContent value="analytics" className="text-sm text-muted-foreground p-4">Analytics panel</TabsContent>
      <TabsContent value="reports" className="text-sm text-muted-foreground p-4">Reports panel</TabsContent>
    </Tabs>
  ),
};
