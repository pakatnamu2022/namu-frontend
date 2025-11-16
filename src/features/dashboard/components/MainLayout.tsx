"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ProfileCard } from "../../users/components/profile-card";
import Header from "@/src/shared/components/header";
import { FeedWidget } from "../../social/components/feed-widget";
// import { Progress } from "@/components/ui/progress";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "20rem",
          // "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        } as React.CSSProperties
      }
    >
      <SidebarLeft />
      <SidebarInset className="bg-muted/30">
        <Header />
        <div className="p-3 flex gap-8 w-full h-[calc(100vh-3.5rem)] overflow-auto">
          {children}
          <div
            className="w-80 h-fit rounded-lg bg-sidebar border-sidebar-border border xl:block hidden z-20 relative"
            style={{ position: "sticky", top: 0, alignSelf: "flex-start" }}
          >
            <FeedWidget />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <ProfileCard variant="sidebar" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
