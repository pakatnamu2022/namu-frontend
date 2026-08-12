import { useQuery } from "@tanstack/react-query";
import { CONCEPT_OBJECTIVE_PERIOD_PV } from "./conceptObjectivePeriodPv.constants.ts";
import { ConceptObjectivePeriodPvResource } from "./conceptObjectivePeriodPv.interface.ts";
import { getAllConceptObjectivePeriodPv } from "./conceptObjectivePeriodPv.actions.ts";

const { QUERY_KEY } = CONCEPT_OBJECTIVE_PERIOD_PV;

export const useAllConceptObjectivePeriodPv = (
  params?: Record<string, any>,
  enabled: boolean = true,
) => {
  return useQuery<ConceptObjectivePeriodPvResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllConceptObjectivePeriodPv({ params }),
    refetchOnWindowFocus: false,
    enabled,
  });
};
