"use client";

import ProfileInfo from "@/features/dashboard/components/ProfileInfo";
import TicsPage from "@/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, Suspense } from "react";
import DashboardSkeleton from "@/shared/components/DashboardSkeleton";
import { findComponentByRoute } from "@/config/routeComponents";

export default function CompanyModulePage() {
  const { company, moduleSlug, currentModule } = useCurrentModule();
  const { permissions } = useAuthStore();
  const router = useNavigate();
  const [PageComponent, setPageComponent] =
    useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPageComponent = () => {
      if (!company || !moduleSlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Buscar componente en el diccionario
      const Component = findComponentByRoute(company, moduleSlug);

      if (Component) {
        setPageComponent(() => Component);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    // Si no hay empresa, no redirigir
    if (!company || company === "") {
      setIsLoading(false);
      return;
    }

    // Si no hay permisos o módulo actual, esperar
    if (!permissions || !currentModule) {
      setIsLoading(true);
      return;
    }

    // Casos especiales que tienen su propia página hardcoded
    if (moduleSlug === "tics") {
      setIsLoading(false);
      return;
    }

    // Si no tiene hijos, intentar cargar la página del módulo
    loadPageComponent();
  }, [company, moduleSlug, permissions, currentModule, router]);

  if (company === "") {
    return <ProfileInfo />;
  }

  if (moduleSlug === "tics") {
    return <TicsPage />;
  }

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
