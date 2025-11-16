"use client";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import renderSidebarItems from "./SidebarItems";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import MenuSkeleton from "@/shared/components/MenuSkeleton";

export default function SidebarDynamicMenu() {
  const { permissions } = useAuthStore();
  const { isLoadingModule, currentView, company, moduleSlug, subModuleSlug } =
    useCurrentModule();

  const moduleItems =
    permissions
      ?.find((perm) => perm.empresa_abreviatura === company)
      ?.menu.find((mod) => mod.slug === moduleSlug)?.children ?? [];

  const subModuleItems =
    moduleItems.find((item) => item.slug === subModuleSlug)?.children ?? [];

  const options = subModuleSlug ? subModuleItems : moduleItems;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-secondary font-semibold">
        Menú
      </SidebarGroupLabel>
      <SidebarMenu>
        {isLoadingModule ? (
          <MenuSkeleton />
        ) : (
          renderSidebarItems(
            options,
            company,
            moduleSlug,
            subModuleSlug,
            currentView
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
