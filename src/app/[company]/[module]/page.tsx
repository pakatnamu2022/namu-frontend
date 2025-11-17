"use client";

import ProfileInfo from "@/features/dashboard/components/ProfileInfo";
import TicsPage from "@/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, Suspense } from "react";
import DashboardSkeleton from "@/shared/components/DashboardSkeleton";
import { findComponentByRoute, findLayoutForRoute } from "@/config/routeComponents";
import { Outlet } from "react-router-dom";

export default function ModulePage() {
  const { company, moduleSlug, currentModule } = useCurrentModule();
  const { permissions } = useAuthStore();
  const router = useNavigate();
  const [PageComponent, setPageComponent] = useState<React.ComponentType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPageComponent = () => {
      if (!company || !moduleSlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      console.log('Intentando cargar página de módulo:', { company, moduleSlug });

      // Buscar componente en el diccionario
      const Component = findComponentByRoute(company, moduleSlug);

      if (Component) {
        console.log('Componente encontrado en diccionario');
        setPageComponent(() => Component);
        setIsLoading(false);
        return;
      }

      console.log('No se encontró página de módulo para cargar');
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

    // Obtener las opciones del módulo actual
    const moduleOptions = currentModule.children || [];

    // Si hay opciones disponibles, redirigir a la primera
    if (moduleOptions.length > 0) {
      const firstOption = moduleOptions[0];

      // Si la primera opción tiene hijos (es un submódulo), redirigir a ese submódulo
      if (firstOption.children && firstOption.children.length > 0) {
        const firstRoute = `/${company}/${moduleSlug}/${
          firstOption.slug || firstOption.id
        }`;
        console.log('Redirigiendo a submódulo:', firstRoute);
        router(firstRoute, { replace: true });
      } else {
        // Si no tiene hijos, redirigir directamente a la vista
        const firstRoute = `/${company}/${moduleSlug}/${
          firstOption.route || firstOption.slug || firstOption.id
        }`;
        console.log('Redirigiendo a vista:', firstRoute);
        router(firstRoute, { replace: true });
      }
      return;
    }

    // Si no tiene hijos, intentar cargar la página del módulo
    console.log('No tiene hijos, intentando cargar página del módulo');
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
