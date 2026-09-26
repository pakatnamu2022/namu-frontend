import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WorkingConditionResource,
  WorkingConditionResponse,
} from "./working-condition.interface";
import {
  findWorkingConditionById,
  getWorkingConditions,
  updateWorkingCondition,
} from "./working-condition.actions";
import { WORKING_CONDITION } from "./working-condition.constant";

const { QUERY_KEY } = WORKING_CONDITION;

export const useWorkingConditions = (params?: Record<string, any>) => {
  return useQuery<WorkingConditionResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorkingConditions(params),
  });
};

export const useWorkingConditionById = (id: number) => {
  return useQuery<WorkingConditionResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkingConditionById(id),
    enabled: !!id,
  });
};

export const useUpdateWorkingCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<Pick<WorkingConditionResource, "amount" | "status">>;
    }) => updateWorkingCondition(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
