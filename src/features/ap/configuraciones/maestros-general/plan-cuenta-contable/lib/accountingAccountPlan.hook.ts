import { useQuery } from "@tanstack/react-query";
import {
  findAccountingAccountPlanById,
  getAccountingAccountPlan,
  getAllAccountingAccountPlan,
} from "./accountingAccountPlan.actions";
import {
  AccountingAccountPlanResource,
  AccountingAccountPlanResponse,
} from "./accountingAccountPlan.interface";
import { ACCOUNTING_ACCOUNT_PLAN } from "./accountingAccountPlan.constants";

const { QUERY_KEY } = ACCOUNTING_ACCOUNT_PLAN;

export const useAccountingAccountPlan = (params?: Record<string, any>) => {
  return useQuery<AccountingAccountPlanResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAccountingAccountPlan({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllAccountingAccountPlan = (params?: Record<string, any>) => {
  return useQuery<AccountingAccountPlanResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllAccountingAccountPlan({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAccountingAccountPlanById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAccountingAccountPlanById(id),
    refetchOnWindowFocus: false,
  });
};
