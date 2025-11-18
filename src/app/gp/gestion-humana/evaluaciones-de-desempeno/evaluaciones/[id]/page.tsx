"use client";

import { useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { EVALUATION } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import PerformanceEvaluationPage from "@/features/gp/gestionhumana/evaluaciondesempeño/dashboard/components/PerformanceEvaluationPage";
import { notFound } from "@/shared/hooks/useNotFound";

const { ROUTE } = EVALUATION;

export default function EvaluationPersonPage() {
  const { id } = useParams();
  // const router = useNavigate();
  const { checkRouteExists, currentView } = useCurrentModule();

  const idEvaluation = Number(id);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!idEvaluation) notFound();

  return <PerformanceEvaluationPage id={idEvaluation} />;
}
