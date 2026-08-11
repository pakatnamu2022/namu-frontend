import { useQuery } from "@tanstack/react-query";
import { CONCEPT_OBJECTIVE_PV } from "./conceptObjectiveMasterPv.constants.ts";
import { ConceptObjectivePvResource } from "./conceptObjectiveMasterPv.interface.ts";
import { getAllConceptObjectivePv } from "./conceptObjectiveMasterPv.actions.ts";

const { QUERY_KEY } = CONCEPT_OBJECTIVE_PV;

export const useAllConceptObjectivePv = (params?: Record<string, any>) => {
  return useQuery<ConceptObjectivePvResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllConceptObjectivePv({ params }),
    refetchOnWindowFocus: false,
  });
};
