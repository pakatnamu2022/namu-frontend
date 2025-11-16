"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ProfileHeader from "@/src/shared/components/ProfileHeader";
import BreadCrumbHeader from "./BreadcrumbHeader";

export default function DashboardHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-primary/10 bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-primary dark:text-primary-foreground hover:bg-primary/10" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary/20" />
        <BreadCrumbHeader />
      </div>
      <ProfileHeader />
    </header>
  );
}
