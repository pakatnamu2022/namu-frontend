import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function BreadCrumbHeader() {
  const {
    currentCompany,
    currentModule,
    currentSubmodule,
    currentView,
    isLoadingModule,
  } = useCurrentModule();

  if (isLoadingModule)
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <span className="text-muted">/</span>
        <Skeleton className="h-4 w-32" />
        <span className="text-muted">/</span>
        <Skeleton className="h-4 w-28" />
        {/* Skeleton adicional para submódulo y vista */}
        <span className="text-muted">/</span>
        <Skeleton className="h-4 w-24" />
        <span className="text-muted">/</span>
        <Skeleton className="h-4 w-20" />
      </div>
    );

  return (
    <Breadcrumb>
      <BreadcrumbList className="!flex-nowrap">
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link
              href="/companies"
              className="text-primary hover:text-secondary text-xs md:text-sm"
            >
              Empresas
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem className="hidden md:block truncate">
          <BreadcrumbLink asChild>
            <Link
              href={`/modules/${currentCompany?.empresa_abreviatura}`}
              className="text-primary hover:text-secondary text-xs md:text-sm"
            >
              {currentCompany?.empresa_nombre || "Empresa"}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem
          className={currentSubmodule || currentView ? "truncate" : "truncate"}
        >
          {currentSubmodule || currentView ? (
            <BreadcrumbLink asChild>
              <Link
                href={`/modules/${currentCompany?.empresa_abreviatura}/${currentModule?.slug}`}
                className="text-primary hover:text-secondary text-xs md:text-sm"
              >
                {currentModule?.descripcion || "Módulo"}
              </Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="text-secondary font-semibold text-xs md:text-sm">
              {currentModule?.descripcion || "Módulo"}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Submódulo */}
        {currentSubmodule && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className={currentView ? "truncate" : "truncate"}>
              {currentView ? (
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${currentCompany?.empresa_abreviatura}/${currentModule?.slug}/${currentSubmodule?.slug}`}
                    className="text-primary hover:text-secondary text-xs md:text-sm"
                  >
                    {currentSubmodule?.descripcion || "Submódulo"}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-secondary font-semibold text-xs md:text-sm">
                  {currentSubmodule?.descripcion || "Submódulo"}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {/* Vista */}
        {currentView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="truncate">
              <BreadcrumbPage className="text-secondary font-semibold text-xs md:text-sm">
                {currentView?.descripcion || "Vista"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
