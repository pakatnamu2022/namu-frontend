"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useNavigate } from "react-router-dom";
import DashboardSkeleton from "@/shared/components/DashboardSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewsResponseMenuChild } from "@/features/views/lib/views.interface";
import * as LucideReact from "lucide-react";
import TitleComponent from "./TitleComponent";
import PageWrapper from "./PageWrapper";
import { SUBTITLE } from "@/core/core.function";
import { ModelInterface } from "@/core/core.interface";

interface ModuleViewsDashboardProps {
  /**
   * Título personalizado para el dashboard
   * Si no se proporciona, se usa el nombre del módulo/submódulo automáticamente
   */
  title?: string;

  /**
   * Subtítulo o descripción del dashboard
   */
  subtitle?: string;
}

/**
 * Componente que muestra un dashboard general con las vistas/rutas disponibles
 * del módulo o submódulo actual. Detecta automáticamente si está en un módulo
 * o submódulo basándose en la ruta actual.
 *
 * @example
 * Dashboard básico (detecta automáticamente módulo/submódulo):
 * export default function MiModuloPage() {
 *   return <ModuleViewsDashboard />;
 * }
 *
 * @example
 * Dashboard con título personalizado:
 * export default function MiModuloPage() {
 *   return (
 *     <ModuleViewsDashboard
 *       title="Mi Dashboard"
 *       subtitle="Descripción personalizada"
 *     />
 *   );
 * }
 */
export default function ModuleViewsDashboard({
  title,
  subtitle,
}: ModuleViewsDashboardProps) {
  const {
    company,
    moduleSlug,
    subModuleSlug,
    currentModule,
    currentSubmodule,
    isLoadingModule,
  } = useCurrentModule();
  const navigate = useNavigate();

  // Esperar a que carguen los permisos y el módulo
  if (isLoadingModule) {
    return <DashboardSkeleton />;
  }

  // Detectar automáticamente si estamos en un submódulo
  // Si currentSubmodule existe, estamos en un submódulo
  const isInSubmodule = !!currentSubmodule;

  // Determinar qué contexto usar
  const context = isInSubmodule ? currentSubmodule : currentModule;
  const children = context?.children || [];

  // Separar submódulos y vistas
  const submodules = children.filter(
    (child) => child.children && child.children.length > 0,
  );
  const views = children.filter(
    (child) => !child.children || child.children.length === 0,
  );

  const displayTitle = title || context?.descripcion || "Dashboard";
  const icon = (context?.icon as keyof typeof LucideReact) || "FolderDot";

  const handleItemClick = (item: ViewsResponseMenuChild) => {
    const itemRoute = item.route || item.slug || item.ruta;

    const fullPath = isInSubmodule
      ? `/${company}/${moduleSlug}/${subModuleSlug}/${itemRoute}`
      : `/${company}/${moduleSlug}/${itemRoute}`;

    navigate(fullPath);
  };

  const getIcon = (iconName: string) => {
    if (!iconName) return null;

    const Icon = (LucideReact as any)[iconName];
    if (!Icon) return null;

    return <Icon className="h-5 w-5 md:w-6 md:h-6" />;
  };

  const hasContent = submodules.length > 0 || views.length > 0;

  return (
    <PageWrapper>
      {/* Header */}
      <TitleComponent title={displayTitle} subtitle={subtitle} icon={icon} />

      {/* Content */}
      {!hasContent ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">
              No hay vistas disponibles en este módulo
            </p>
          </div>
        </div>
      ) : (
        <div className="md:space-y-8">
          {/* Submódulos */}
          {submodules.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Submódulos
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {submodules.map((submodule) => (
                  <Card
                    key={submodule.id}
                    className="py-0 gap-0 cursor-pointer transition-all hover:shadow-lg hover:scale-105 active:scale-95 border-2"
                    onClick={() => handleItemClick(submodule)}
                  >
                    <CardHeader className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary-foreground">
                          {getIcon(submodule.icon ?? "FolderOpen") || (
                            <LucideReact.FolderOpen className="h-5 w-5 md:w-6 md:h-6" />
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-2">
                          {submodule.descripcion}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {submodule.children?.length || 0} opciones
                        </p>
                        <LucideReact.ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Vistas */}
          {views.length > 0 && (
            <div className="space-y-4">
              {submodules.length > 0 && (
                <h2 className="text-xl font-semibold text-muted-foreground">
                  Vistas
                </h2>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {views.map((view) => (
                  <Card
                    key={view.id}
                    className="py-0 cursor-pointer transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                    onClick={() => handleItemClick(view)}
                  >
                    <CardHeader className="space-y-1 p-2 gap-0! md:p-6 h-full">
                      <div className="flex items-center gap-3 h-full">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                          {getIcon(view.icon ?? "FileText") || (
                            <LucideReact.FileText className="h-5 w-5 md:w-6 md:h-6" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base line-clamp-2">
                            {view.descripcion}
                          </CardTitle>
                          <CardDescription className="text-xs md:text-sm">
                            {SUBTITLE(
                              {
                                name: view.descripcion,
                              } as ModelInterface,
                              "manage",
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
