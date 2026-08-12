import { useQuery } from "@tanstack/react-query";
import { getAllBudgets, getBudgets, findBudgetsById } from "./budgets.actions";
import { BudgetsResource, BudgetsResponse } from "./budgets.interface";
import { BUDGETS } from "./budgets.constants";

const { QUERY_KEY } = BUDGETS;

export const useBudgets = (params?: Record<string, any>) => {
  return useQuery<BudgetsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getBudgets({ params }),
  });
};

export const useAllBudgets = (params?: Record<string, any>) => {
  return useQuery<BudgetsResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllBudgets({ params }),
  });
};

export const useBudgetsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBudgetsById(id),

    enabled: id > 0,
  });
};
