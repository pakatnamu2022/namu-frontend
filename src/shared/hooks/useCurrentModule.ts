"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { ViewsResponseMenuChild } from "@/features/views/lib/views.interface";

function findRouteInChildren(
  children: ViewsResponseMenuChild[],
  routeToFind: string
): ViewsResponseMenuChild | null {
  for (const item of children) {
    if (item.route === routeToFind) return item;
    if (item.children?.length) {
      const found = findRouteInChildren(item.children, routeToFind);
      if (found) return found;
    }
  }
  return null;
}

export function parseDashboardPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return {
    segments,
    company: segments[0] === "modules" ? segments[1] : segments[0], // empresa_abreviatura
    module: segments[0] === "modules" ? segments[2] : segments[1], // puede ser slug o id del módulo
    third: segments[2] ?? "",
    fourth: segments[3] ?? "",
  };
}

export function useCurrentModule() {
  const pathname = usePathname();
  const {
    company,
    module: moduleSlug,
    third,
    fourth,
  } = parseDashboardPath(pathname);

  const { permissions } = useAuthStore();

  const currentCompany = permissions?.find(
    (p) => p.empresa_abreviatura === company
  );

  const currentModule = currentCompany?.menu.find((m) => m.slug === moduleSlug);

  // Solo consideramos submódulo si el hijo tiene hijos
  const currentSubmodule = currentModule?.children.find(
    (child) =>
      (child.slug === third || child.id.toString() === third) &&
      Array.isArray(child.children) &&
      child.children.length > 0
  );

  const isSubModule = !!currentSubmodule;
  const viewSlug = isSubModule ? fourth : third;

  const currentView = isSubModule
    ? findRouteInChildren(currentSubmodule?.children ?? [], viewSlug)
    : findRouteInChildren(currentModule?.children ?? [], viewSlug);

  const type =
    !third && !fourth
      ? "module-main"
      : isSubModule && !fourth
      ? "submodule-main"
      : isSubModule
      ? "submodule-view"
      : "module-view";

  const isLoadingModule = !permissions || !currentModule;

  const checkRouteExists = (route: string): boolean => {
    return currentModule?.children
      ? !!findRouteInChildren(currentModule.children, route)
      : false;
  };

  return {
    company,
    moduleSlug,
    subModuleSlug: isSubModule ? third : "",
    currentCompany,
    currentModule,
    currentSubmodule: isSubModule ? currentSubmodule : null,
    currentView,
    viewSlug,
    type,
    checkRouteExists,
    isLoadingModule,
  };
}
