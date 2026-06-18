"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ProfileCard } from "@/features/users/components/profile-card";
import Header from "@/shared/components/header";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
          // "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        } as React.CSSProperties
      }
    >
      <SidebarLeft />
      <SidebarInset className="bg-background">
        <Header />
        <div className="p-3 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} variant="inset">
      <SidebarContent>
        <ProfileCard variant="sidebar" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
