"use client";

import ProfileInfo from "@/src/features/dashboard/components/ProfileInfo";
import TicsPage from "@/src/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useAuthStore } from "@/src/features/auth/lib/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ModulePage() {
  const { company, moduleSlug, currentModule } = useCurrentModule();
  const { permissions } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Si no hay empresa, no redirigir
    if (!company || company === "") return;

    // Si no hay permisos o módulo actual, esperar
    if (!permissions || !currentModule) return;

    // Casos especiales que tienen su propia página
    if (moduleSlug === "tics") return;

    // Obtener las opciones del módulo actual
    const moduleOptions = currentModule.children || [];

    // Si hay opciones disponibles, redirigir a la primera
    if (moduleOptions.length > 0) {
      const firstOption = moduleOptions[0];

      // Si la primera opción tiene hijos (es un submódulo), redirigir a ese submódulo
      if (firstOption.children && firstOption.children.length > 0) {
        const firstRoute = `/${company}/${moduleSlug}/${firstOption.slug || firstOption.id}`;
        router.replace(firstRoute);
      } else {
        // Si no tiene hijos, redirigir directamente a la vista
        const firstRoute = `/${company}/${moduleSlug}/${firstOption.route || firstOption.slug || firstOption.id}`;
        router.replace(firstRoute);
      }
    }
  }, [company, moduleSlug, permissions, currentModule, router]);

  if (company === "") {
    return <ProfileInfo />;
  }

  if (moduleSlug === "tics") {
    return <TicsPage />;
  }

  // Mientras se procesa la redirección, mostrar null o un loader
  return null;
}
