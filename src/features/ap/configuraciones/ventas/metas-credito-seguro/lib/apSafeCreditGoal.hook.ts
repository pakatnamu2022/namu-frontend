import { useQuery } from "@tanstack/react-query";
import { AP_SAFE_CREDIT_GOAL } from "./apSafeCreditGoal.constants";
import { ApSafeCreditGoalResponse } from "./apSafeCreditGoal.interface";
import {
  findApSafeCreditGoalById,
  getApSafeCreditGoal,
} from "./apSafeCreditGoal.actions";

const { QUERY_KEY } = AP_SAFE_CREDIT_GOAL;

export const useApSafeCreditGoal = (params?: Record<string, any>) => {
  return useQuery<ApSafeCreditGoalResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApSafeCreditGoal({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useApSafeCreditGoalById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findApSafeCreditGoalById(id),
    refetchOnWindowFocus: false,
  });
};
