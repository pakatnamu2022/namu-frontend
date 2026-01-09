"use client";

import PerformanceEvaluationPage from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/components/PerformanceEvaluationPage";
import { useActivePerformanceEvaluation } from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/lib/performance-evaluation.hook";
import { EVALUATION } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import ModuleViewsDashboard from "@/shared/components/ModuleViewsDashboard";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

export default function EvaluacionesDesempenoPage() {
  const { ROUTE } = EVALUATION;
  const { canView } = useModulePermissions(ROUTE);
  const { data: activeEvaluation, isLoading } =
    useActivePerformanceEvaluation();

  if (canView && (!activeEvaluation || isLoading))
    return <ModuleViewsDashboard />;

  return <PerformanceEvaluationPage />;
}
