import { useQuery } from "@tanstack/react-query";
import { SunatConceptsResource } from "./sunatConcepts.interface";
import { getAllSunatConcepts } from "./sunatConcepts.actions";

export const useAllSunatConcepts = (params?: Record<string, any>) => {
  return useQuery<SunatConceptsResource[]>({
    queryKey: ["sunatConcepts", params],
    queryFn: () => getAllSunatConcepts(params),
    refetchOnWindowFocus: false,
  });
};
