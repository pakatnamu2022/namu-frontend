"use client";

import { notFound, useParams } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { EVALUATION } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/evaluaciones/lib/evaluation.constans";
import PerformanceEvaluationPage from "@/src/features/gp/gestionhumana/evaluaciondesempeño/dashboard/components/PerformanceEvaluationPage";

const { ROUTE } = EVALUATION;

export default function EvaluationPersonPage() {
  const { id } = useParams();
  // const router = useRouter();
  const { checkRouteExists, currentView } = useCurrentModule();

  const idEvaluation = Number(id);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!idEvaluation) notFound();

  return <PerformanceEvaluationPage id={idEvaluation} />;
}
