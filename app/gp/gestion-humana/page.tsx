"use client";

import DashboardWidgets from "@/src/features/dashboard/components/DashboardWidgets";
import ProfileInfo from "@/src/features/dashboard/components/ProfileInfo";
import TicsPage from "@/src/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";

export default function ModulePage() {
  const { company, moduleSlug, subModuleSlug } = useCurrentModule();

  if (company === "") {
    return <ProfileInfo />;
  }

  if (moduleSlug === "evaluaciones-de-desempeno") {
    return <TicsPage />;
  }

  if (subModuleSlug === "evaluaciones-de-desempeno") {
    return <TicsPage />;
  }

  return <DashboardWidgets />;
}
