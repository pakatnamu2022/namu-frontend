"use client";

import DashboardWidgets from "@/features/dashboard/components/DashboardWidgets";
import ProfileInfo from "@/features/dashboard/components/ProfileInfo";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import MetricasPage from "./metricas/page";
import PerformanceEvaluationPage from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/components/PerformanceEvaluationPage";
import NotFound from '@/app/not-found';


export default function ModulePage() {
    const { company, subModuleSlug } = useCurrentModule();

  if (company === "") {
    return <ProfileInfo />;
  }

  if (subModuleSlug === "evaluaciones-de-desempeno") {
    return <PerformanceEvaluationPage />;
  }

  if (subModuleSlug === "metricas") {
    return <MetricasPage />;
  }

  if (subModuleSlug === "null") return <NotFound />;

  return <DashboardWidgets />;
}
