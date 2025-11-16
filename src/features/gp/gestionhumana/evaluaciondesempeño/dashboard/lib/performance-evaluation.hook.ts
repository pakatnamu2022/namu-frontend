import { useQuery } from "@tanstack/react-query";
import { EvaluationResource } from "../../evaluaciones/lib/evaluation.interface";
import { getActiveEvaluation } from "../../evaluaciones/lib/evaluation.actions";

export const useActivePerformanceEvaluation = () => {
  return useQuery<EvaluationResource | null>({
    queryKey: ["active-evaluation"],
    queryFn: async () => {
      try {
        const result = await getActiveEvaluation();
        return result || null;
      } catch (error) {
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });
};
