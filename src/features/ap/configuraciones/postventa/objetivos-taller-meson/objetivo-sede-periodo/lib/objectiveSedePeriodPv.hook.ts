import { useQuery } from "@tanstack/react-query";
import { OBJECTIVE_SEDE_PERIOD_PV } from "./objectiveSedePeriodPv.constants.ts";
import { ObjectiveSedePeriodPvResource } from "./objectiveSedePeriodPv.interface.ts";
import {
  findObjectiveSedePeriodPvById,
  getAllObjectiveSedePeriodPv,
} from "./objectiveSedePeriodPv.actions.ts";

const { QUERY_KEY } = OBJECTIVE_SEDE_PERIOD_PV;

export const useAllObjectiveSedePeriodPv = (
  params?: Record<string, any>,
  enabled: boolean = true,
) => {
  return useQuery<ObjectiveSedePeriodPvResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllObjectiveSedePeriodPv({ params }),
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useObjectiveSedePeriodPvById = (id?: number) => {
  return useQuery<ObjectiveSedePeriodPvResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findObjectiveSedePeriodPvById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
