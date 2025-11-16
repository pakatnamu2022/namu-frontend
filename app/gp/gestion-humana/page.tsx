"use client";

import DashboardWidgets from "@/features/dashboard/components/DashboardWidgets";
import ProfileInfo from "@/features/dashboard/components/ProfileInfo";
import TicsPage from "@/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";

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
