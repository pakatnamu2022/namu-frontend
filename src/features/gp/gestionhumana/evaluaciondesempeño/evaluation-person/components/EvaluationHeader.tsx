"use client";

import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";
import EvaluationSectionHeader from "./EvaluationSectionHeader";

interface EvaluationHeaderProps {
  evaluationPersonResult: EvaluationPersonResultResource;
  completedObjectives: number;
  totalObjectives: number;
  showProgress?: boolean;
}

export default function EvaluationHeader({
  evaluationPersonResult,
  completedObjectives,
  totalObjectives,
  showProgress = true,
}: EvaluationHeaderProps) {
  const score = evaluationPersonResult.objectivesResult;
  const max = evaluationPersonResult.maxObjectiveParameter ?? 1;

  return (
    <EvaluationSectionHeader
      title="Evaluación de Objetivos"
      subtitle="Resultados y metas personales del período"
      showProgress={showProgress}
      stats={[
        {
          value: `${score.toFixed(1)} / ${max}`,
          label: "Promedio",
          progress: (score / max) * 100,
        },
        {
          value: `${completedObjectives} / ${totalObjectives}`,
          label: "Completados",
        },
      ]}
    />
  );
}
