"use client";

import ProfileInfo from "@/features/dashboard/components/ProfileInfo";
import TicsPage from "@/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useEffect } from "react";
import MetricasPage from "../../../gp/gestion-humana/evaluaciones-de-desempeno/metricas/page";
import NotFound from "@/app/not-found";


export default function ModulePage() {
    const { company, moduleSlug, subModuleSlug, currentSubmodule } =
    useCurrentModule();
  const { permissions } = useAuthStore();
  const router = useNavigate();
  

  useEffect(() => {
    // Si no hay empresa, no redirigir
    if (!company || company === "") return;

    // Si no hay permisos o submódulo actual, esperar
    if (!permissions || !currentSubmodule) return;

    // Casos especiales que tienen su propia página
    if (subModuleSlug === "tics" || subModuleSlug === "metricas") return;

    // Obtener las opciones del submódulo actual
    const subModuleOptions = currentSubmodule.children || [];

    // Si hay opciones disponibles, redirigir a la primera
    if (subModuleOptions.length > 0) {
      const firstOption = subModuleOptions[0];
      const firstRoute = `/${company}/${moduleSlug}/${subModuleSlug}/${
        firstOption.route || firstOption.slug || firstOption.id
      }`;
      router(firstRoute, { replace: true });
    }
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

  // Mientras se procesa la redirección, mostrar null o un loader
  return null;
}
