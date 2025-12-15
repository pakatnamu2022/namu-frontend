import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BreadCrumbHeader() {
  const {
    currentCompany,
    currentModule,
    currentSubmodule,
    currentView,
    isLoadingModule,
  } = useCurrentModule();
  const isMobile = useIsMobile();

  if (isLoadingModule)
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <span className="text-muted">/</span>
        <Skeleton className="h-4 w-32" />
        {!isMobile && (
          <>
            <span className="text-muted">/</span>
            <Skeleton className="h-4 w-28" />
            <span className="text-muted">/</span>
            <Skeleton className="h-4 w-24" />
            <span className="text-muted">/</span>
            <Skeleton className="h-4 w-20" />
          </>
        )}
      </div>
    );

  // Construir array de breadcrumbs
  const breadcrumbs = [];

  // 1. Empresas
  breadcrumbs.push({
    key: "empresas",
    link: "/companies",
    label: "Empresas",
    isLast: !currentCompany && !currentModule && !currentSubmodule && !currentView,
  });

  // 2. Empresa
  if (currentCompany) {
    breadcrumbs.push({
      key: "empresa",
      link: `/modules/${currentCompany.empresa_abreviatura}`,
      label: currentCompany.empresa_nombre || "Empresa",
      isLast: !currentModule && !currentSubmodule && !currentView,
    });
  }

  // 3. Módulo
  if (currentModule) {
    breadcrumbs.push({
      key: "modulo",
      link: `/modules/${currentCompany?.empresa_abreviatura}/${currentModule.slug}`,
      label: currentModule.descripcion || "Módulo",
      isLast: !currentSubmodule && !currentView,
    });
  }

  // 4. Submódulo
  if (currentSubmodule) {
    breadcrumbs.push({
      key: "submodulo",
      link: `/${currentCompany?.empresa_abreviatura}/${currentModule?.slug}/${currentSubmodule.slug}`,
      label: currentSubmodule.descripcion || "Submódulo",
      isLast: !currentView,
    });
  }

  // 5. Vista
  if (currentView) {
    breadcrumbs.push({
      key: "vista",
      link: null,
      label: currentView.descripcion || "Vista",
      isLast: true,
    });
  }

  // Si es mobile, tomar solo los últimos 2
  const visibleBreadcrumbs = isMobile
    ? breadcrumbs.slice(-2)
    : breadcrumbs;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-0.5">
        {visibleBreadcrumbs.map((breadcrumb) => (
          <div key={breadcrumb.key} className="flex items-center">
            {breadcrumb.isLast ? (
              <span className="text-secondary font-semibold text-xs">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.link!}
                className="text-primary hover:text-secondary text-xs"
              >
                {breadcrumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleBreadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.key} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage className="text-secondary font-semibold text-sm">
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={breadcrumb.link!}
                    className="text-primary hover:text-secondary text-sm"
                  >
                    {breadcrumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
