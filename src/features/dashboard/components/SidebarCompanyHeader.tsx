"use client";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import * as LucideReact from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from 'react-router-dom'
import { SidebarCompanyHeaderLoading } from "./SidebarCompanyHeaderLoading";

export default function SidebarCompanyHeader() {
  const { currentSubmodule, currentModule, currentCompany, isLoadingModule } =
    useCurrentModule();
  const IconComponent = LucideReact[
    currentModule?.icon ?? "FolderDot"
  ] as React.ComponentType<any>;

  const route = currentSubmodule
    ? `/${currentCompany?.empresa_abreviatura}/${currentModule?.slug}/${currentSubmodule?.slug}`
    : `/${currentCompany?.empresa_abreviatura}/${currentModule?.slug}`;

  const name = currentSubmodule?.descripcion ?? currentModule?.descripcion;

  if (isLoadingModule) return <SidebarCompanyHeaderLoading />;

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link className="group-data-[collapsible=icon]:!px-0" href={route}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
                <IconComponent className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="line-clamp-2 font-medium">{name}</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
