"use client";

import MetricasPage from "@/app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/page";
import ProfileInfo from "@/src/features/dashboard/components/ProfileInfo";
import TicsPage from "@/src/features/gp/tics/dashboard/components/TicsPage";
import {useCurrentModule} from "@/src/shared/hooks/useCurrentModule";
import {notFound, useRouter} from "next/navigation";
import {useAuthStore} from "@/src/features/auth/lib/auth.store";
import {useEffect} from "react";

export default function ModulePage() {
    const {company, moduleSlug, subModuleSlug, currentSubmodule} = useCurrentModule();
    const {permissions} = useAuthStore();
    const router = useRouter();

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
            const firstRoute = `/${company}/${moduleSlug}/${subModuleSlug}/${firstOption.route || firstOption.slug || firstOption.id}`;
            router.replace(firstRoute);
        }
    }, [company, moduleSlug, subModuleSlug, permissions, currentSubmodule, router]);

    if (company === "") {
        return <ProfileInfo/>;
    }

    if (subModuleSlug === "tics") {
        return <TicsPage/>;
    }

    if (subModuleSlug === "metricas") {
        return <MetricasPage/>;
    }

    if (subModuleSlug === "null") notFound();

    // Mientras se procesa la redirección, mostrar null o un loader
    return null;
}
