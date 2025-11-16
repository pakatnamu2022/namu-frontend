"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardHeaderLoading() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-primary/10 bg-background px-4">
      <SidebarTrigger className="-ml-1 text-primary hover:bg-primary/10" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-primary/20" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </header>
  );
}
