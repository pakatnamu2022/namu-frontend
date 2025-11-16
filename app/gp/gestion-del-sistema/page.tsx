"use client";

import DashboardWidgets from "@/src/features/dashboard/components/DashboardWidgets";
import ProfileInfo from "@/src/features/dashboard/components/ProfileInfo";
import TicsPage from "@/src/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";

export default function ModulePage() {
  const { company, moduleSlug } = useCurrentModule();

  if (company === "") {
    return <ProfileInfo />;
  }

  if (moduleSlug === "tics") {
    return <TicsPage />;
  }

  return <DashboardWidgets />;
}
