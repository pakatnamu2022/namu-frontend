"use client";

import DashboardWidgets from "@/src/features/dashboard/components/DashboardWidgets";
import ProfileInfo from "@/src/features/dashboard/components/ProfileInfo";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { notFound } from "next/navigation";
import MetricasPage from "./metricas/page";
import PerformanceEvaluationPage from "@/src/features/gp/gestionhumana/evaluaciondesempeño/dashboard/components/PerformanceEvaluationPage";

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

  if (subModuleSlug === "null") notFound();

  return <DashboardWidgets />;
}
