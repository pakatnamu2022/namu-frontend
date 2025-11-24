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

export default function Layout({ children }: { children: React.ReactNode }) {

  
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
      <SidebarInset className="bg-linear-to-br from-slate-50 to-blue-50/30">
        <Header />
        <div className="flex gap-8 w-full h-[calc(100vh-3.5rem)] overflow-auto">
          <div className="p-3 w-full">
            {children}
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
