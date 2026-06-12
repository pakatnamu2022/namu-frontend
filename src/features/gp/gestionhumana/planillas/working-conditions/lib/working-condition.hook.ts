import { useQuery } from "@tanstack/react-query";
import {
  WorkingConditionResource,
  WorkingConditionResponse,
} from "./working-condition.interface";
import {
  findWorkingConditionById,
  getWorkingConditions,
} from "./working-condition.actions";
import { WORKING_CONDITION } from "./working-condition.constant";

const { QUERY_KEY } = WORKING_CONDITION;

export const useWorkingConditions = (params?: Record<string, any>) => {
  return useQuery<WorkingConditionResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorkingConditions(params),
    refetchOnWindowFocus: false,
  });
};

export const useWorkingConditionById = (id: number) => {
  return useQuery<WorkingConditionResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkingConditionById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
