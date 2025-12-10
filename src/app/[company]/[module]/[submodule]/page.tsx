"use client";

import ProfileInfo from "@/features/dashboard/components/ProfileInfo";
import TicsPage from "@/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useEffect, useState, Suspense } from "react";
import MetricasPage from "../../../gp/gestion-humana/evaluaciones-de-desempeno/metricas/page";
import { notFound } from "@/shared/hooks/useNotFound";
import DashboardSkeleton from "@/shared/components/DashboardSkeleton";
import { findComponentByRoute } from "@/config/routeComponents";

export default function ModulePage() {
  const { company, moduleSlug, subModuleSlug, currentSubmodule } =
    useCurrentModule();
  const { permissions } = useAuthStore();
  const router = useNavigate();
  const [PageComponent, setPageComponent] =
    useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPageComponent = () => {
      if (!company || !moduleSlug || !subModuleSlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Buscar componente en el diccionario
      const Component = findComponentByRoute(
        company,
        moduleSlug,
        subModuleSlug
      );

      if (Component) {
        setPageComponent(() => Component);
        setIsLoading(false);
        return;
      }

      // Si no se encontró ninguna página, dejar loading en false
      setIsLoading(false);
    };

    // Si no hay empresa, no redirigir
    if (!company || company === "") {
      setIsLoading(false);
      return;
    }

    // Si no hay permisos o submódulo actual, esperar
    if (!permissions || !currentSubmodule) {
      setIsLoading(true);
      return;
    }

    // Casos especiales que tienen su propia página hardcoded
    if (subModuleSlug === "tics" || subModuleSlug === "metricas") {
      setIsLoading(false);
      return;
    }

    // Si no tiene hijos, intentar cargar la página del submódulo
    loadPageComponent();
  }, [
    company,
    moduleSlug,
    subModuleSlug,
    permissions,
    currentSubmodule,
    router,
  ]);

  if (company === "") {
    return <ProfileInfo />;
  }

  if (subModuleSlug === "tics") {
    return <TicsPage />;
  }

  if (subModuleSlug === "metricas") {
    return <MetricasPage />;
  }

  if (subModuleSlug === "null") notFound();

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Si se cargó un componente dinámico, renderizarlo
  if (PageComponent) {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <PageComponent />
      </Suspense>
    );
  }

  // Si no hay componente y no está redirigiendo, mostrar null (continuará la redirección)
  return null;
}
