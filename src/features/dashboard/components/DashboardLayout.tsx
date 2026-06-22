"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarCompanyHeader from "./SidebarCompanyHeader";
import SidebarNavigation from "./SidebarNavigation";
import SidebarDynamicMenu from "./SidebarDynamicMenu";
import DashboardHeader from "./DashboardHeader";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import DashboardSkeleton from "@/shared/components/DashboardSkeleton";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingModule, company, moduleSlug } = useCurrentModule();
  const location = useLocation();
  const manualesPath = `/${company}/${moduleSlug}/manuales`;
  const isManualesActive = location.pathname === manualesPath;

  useEffect(() => {
    document.body.classList.add(
      "bg-linear-to-br",
      "from-slate-50",
      "to-primary/5",
    );

    return () => {
      document.body.classList.remove(
        "bg-linear-to-br",
        "from-slate-50",
        "to-primary/5",
      );
    };
  }, []);

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarCompanyHeader />
        <SidebarContent>
          <SidebarNavigation />
          <SidebarDynamicMenu />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isManualesActive}>
                <Link to={manualesPath}>
                  <BookOpen />
                  <span>Manuales</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <DashboardHeader />
        {isLoadingModule ? (
          <div className="flex items-start justify-center h-full">
            <DashboardSkeleton />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 p-4 bg-background w-full overflow-x-auto max-w-(--breakpoint-3xl) mx-auto">
            {/* <div className="flex flex-1 flex-col gap-4 p-4 bg-linear-to-br from-slate-50 to-primary/5 w-full overflow-x-auto"> */}
            {children}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
