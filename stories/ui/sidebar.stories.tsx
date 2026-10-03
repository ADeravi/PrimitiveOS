import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Inbox, Calendar, Search, Settings } from "lucide-react";

const meta: Meta = { title: "UI/Sidebar", tags: ["autodocs"], parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex min-h-[400px] w-full">
        <Sidebar>
          <SidebarHeader><div className="px-2 py-1 font-semibold text-sm">Acme Inc</div></SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}><item.icon /><span>{item.title}</span></a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter><div className="px-2 py-1 text-xs text-muted-foreground">v1.0.0</div></SidebarFooter>
        </Sidebar>
        <main className="flex flex-1 flex-col p-6 gap-4">
          <SidebarTrigger />
          <p className="text-sm text-muted-foreground">Main content area</p>
        </main>
      </div>
    </SidebarProvider>
  ),
};
