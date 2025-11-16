"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarNavigation() {
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const { currentCompany, currentModule, subModuleSlug, isLoadingModule } =
    useCurrentModule();

  const handleBack = () => {
    if (subModuleSlug) {
      router.push(
        `/modules/${currentCompany?.empresa_abreviatura}/${currentModule?.slug}`
      );
    } else {
      router.push(`/modules/${currentCompany?.empresa_abreviatura}`);
    }

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleHome = () => {
    router.push("/companies");

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-secondary font-semibold">
        Navegación
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleHome}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Home className="size-4" />
              <span>Inicio</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isLoadingModule ? (
            <Skeleton className="h-8 w-full bg-secondary/10 rounded-md" />
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleBack}
                className="hover:bg-secondary/10 hover:text-secondary"
              >
                <ArrowLeft className="size-4" />
                <span>
                  {subModuleSlug
                    ? `Volver a ${currentModule?.descripcion}`
                    : `Volver a ${currentCompany?.empresa_nombre}`}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
