"use client";

import DashboardWidgets from "@/features/dashboard/components/DashboardWidgets";
import ProfileInfo from "@/features/dashboard/components/ProfileInfo";
import TicsPage from "@/features/gp/tics/dashboard/components/TicsPage";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";

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
