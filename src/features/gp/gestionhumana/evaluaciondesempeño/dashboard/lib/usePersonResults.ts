import { useQuery } from "@tanstack/react-query";
import { getAllEvaluationPersonResult } from "../../evaluation-person/lib/evaluationPerson.actions";
import { EvaluationPersonResultResource } from "../../evaluation-person/lib/evaluationPerson.interface";

export interface PersonResultsParams {
  evaluation_id: number;
  is_completed?: 0 | 1;
  is_in_progress?: 0 | 1;
}

export const usePersonResults = (params: PersonResultsParams | null) => {
  return useQuery<EvaluationPersonResultResource[]>({
    queryKey: ["personResults", params],
    queryFn: () => {
      if (!params) throw new Error("No parameters provided");
      return getAllEvaluationPersonResult(params);
    },
    enabled: !!params,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
};

export const usePersonResultsByType = (
  evaluationId: number,
  type: "completed" | "in_progress" | "not_started" | "total",
) => {
  const getParams = (): PersonResultsParams | null => {
    if (!evaluationId) return null;

    const baseParams = { evaluation_id: evaluationId, all: true };

    switch (type) {
      case "completed":
        return { ...baseParams, is_completed: 1 };
      case "in_progress":
        return { ...baseParams, is_in_progress: 1 };
      case "not_started":
        // For not started, we want people who are neither completed nor in progress
        // The API should handle this logic server-side, but we can pass both as 0
        return { ...baseParams, is_completed: 0, is_in_progress: 0 };
      case "total":
        // For total, don't filter by completion status
        return baseParams;
      default:
        return null;
    }
  };

  return usePersonResults(getParams());
};
