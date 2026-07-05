"use client";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

const meta: Meta = {
  title: "Nests/Patterns/Settings Page",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A composed, real-world screen showing how the components work together: tabbed navigation, form cards, switch rows, status badges and functional alerts — all driven by the active design layer.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

function SwitchRow({
  id,
  title,
  description,
  defaultChecked,
}: {
  id: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}

export const SettingsPage: Story = {
  name: "Settings Page",
  render: () => (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your workspace preferences and account.
            </p>
          </div>
          <Badge variant="success">Pro plan</Badge>
        </div>

        <Alert variant="info">
          <Info />
          <AlertTitle>Workspace migration scheduled</AlertTitle>
          <AlertDescription>
            Your workspace moves to the EU region on June 14. No action required.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is how others see you in the workspace.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="first">First name</Label>
                  <Input id="first" defaultValue="Ada" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last">Last name</Label>
                  <Input id="last" defaultValue="Lovelace" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="set-email">Email</Label>
                  <Input id="set-email" type="email" defaultValue="ada@example.com" />
                  <p className="text-xs text-muted-foreground">Used for sign-in and notifications.</p>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="aest">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern (EST)</SelectItem>
                      <SelectItem value="pst">Pacific (PST)</SelectItem>
                      <SelectItem value="aest">Sydney (AEST)</SelectItem>
                      <SelectItem value="jst">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t">
                <Button variant="ghost">Reset</Button>
                <Button>Save changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email notifications</CardTitle>
                <CardDescription>Choose what we email you about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SwitchRow
                  id="n-comments"
                  title="Comments"
                  description="When someone comments on your documents."
                  defaultChecked
                />
                <Separator />
                <SwitchRow
                  id="n-mentions"
                  title="Mentions"
                  description="When someone @mentions you."
                  defaultChecked
                />
                <Separator />
                <SwitchRow
                  id="n-digest"
                  title="Weekly digest"
                  description="A summary of workspace activity every Monday."
                />
                <Separator />
                <SwitchRow
                  id="n-marketing"
                  title="Product updates"
                  description="News about features and improvements."
                />
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t">
                <Button>Save preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan</CardTitle>
                <CardDescription>You are on the Pro plan, billed monthly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      Pro <Badge variant="success">Active</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      $24 / month · renews July 1, 2026
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Change plan</Button>
                </div>
                <Alert variant="warning">
                  <Info />
                  <AlertTitle>Card expiring soon</AlertTitle>
                  <AlertDescription>
                    Your Visa ending 4242 expires next month. Update it to avoid interruption.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="justify-between border-t">
                <Button variant="ghost" className="text-destructive hover:text-destructive">
                  Cancel subscription
                </Button>
                <Button>Update payment method</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};
