import { BadgeColor } from "@/components/ui/badge";
import { EvaluationPersonResultResource } from "./evaluationPerson.interface";

export const getQuickStats = (
  evaluationPersonResult: EvaluationPersonResultResource,
) => {
  const totalCompetence =
    evaluationPersonResult.competenceGroups?.reduce(
      (sum, group) => sum + group.total_sub_competences,
      0,
    ) || 0;

  const totalObjectives = evaluationPersonResult.hasObjectives
    ? evaluationPersonResult.details?.length || 0
    : 0;

  const completedCompetence =
    evaluationPersonResult.competenceGroups?.reduce(
      (sum, group) => sum + group.completed_evaluations,
      0,
    ) || 0;

  const completedObjectives = evaluationPersonResult.hasObjectives
    ? evaluationPersonResult.details?.filter(
        (detail) => parseFloat(detail.result) > 0,
      ).length || 0
    : 0;

  const competenceCompletionPercentage = evaluationPersonResult.competenceGroups
    ? Math.round(
        (evaluationPersonResult.competenceGroups.reduce(
          (sum, group) => sum + group.completed_evaluations,
          0,
        ) /
          evaluationPersonResult.competenceGroups.reduce(
            (sum, group) => sum + group.total_sub_competences,
            0,
          )) *
          100,
      )
    : 0;
  const objectiveCompletionPercentage =
    evaluationPersonResult.hasObjectives && evaluationPersonResult.details
      ? Math.round(
          (evaluationPersonResult.details.filter(
            (detail) => parseFloat(detail.result) > 0,
          ).length /
            evaluationPersonResult.details.length) *
            100,
        )
      : 0;

  const overallCompletion = Math.round(
    (competenceCompletionPercentage + objectiveCompletionPercentage) /
      (evaluationPersonResult.hasObjectives ? 2 : 1),
  );

  return {
    totalCompetence: totalCompetence,
    completedCompetence: completedCompetence,
    totalObjectives: totalObjectives,
    completedObjectives: completedObjectives,
    overallCompletion: overallCompletion,
    competenceCompletionPercentage: competenceCompletionPercentage,
    objectiveCompletionPercentage: objectiveCompletionPercentage,
  };
};

export const getProgressColor = (overallCompletionRate: number) => {
  if (overallCompletionRate === 100) return "bg-green-500";
  if (overallCompletionRate >= 50) return "bg-amber-500";
  if (overallCompletionRate > 0) return "bg-orange-500";
  return "bg-red-500";
};

export const getProgressBackgroundColor = (overallCompletionRate: number) => {
  if (overallCompletionRate === 100) return "bg-green-50";
  if (overallCompletionRate >= 50) return "bg-amber-50";
  if (overallCompletionRate > 0) return "bg-orange-50";
  return "bg-red-50";
};

export const getColorByCompletionRate = (rate: number): BadgeColor => {
  if (rate >= 100) return "green";
  if (rate >= 50) return "amber";
  if (rate > 0) return "orange";
  return "red";
};

export const getComplianceBadgeColor = (percentage: number): BadgeColor => {
  if (percentage >= 90) return "default";
  if (percentage >= 70) return "tertiary";
  if (percentage >= 50) return "red";
  return "gray";
};
