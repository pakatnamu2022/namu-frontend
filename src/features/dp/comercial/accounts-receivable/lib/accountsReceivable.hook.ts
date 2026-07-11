import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ACCOUNTS_RECEIVABLE } from "./accountsReceivable.constants";
import {
  getAccountsReceivable,
  getAccountReceivableById,
  getFilterTree,
  getAccountsReceivableDashboard,
} from "./accountsReceivable.actions";
import type {
  AccountsReceivableFilters,
  DashboardFilters,
} from "./accountsReceivable.interface";

const { QUERY_KEY } = ACCOUNTS_RECEIVABLE;

export const useAccountsReceivable = (filters: AccountsReceivableFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getAccountsReceivable(filters),
    placeholderData: keepPreviousData,
  });
};

export const useAccountReceivableById = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => getAccountReceivableById(id!),
    enabled: !!id,
  });
};

export const useAccountsReceivableDashboard = (
  company: string,
  filters?: DashboardFilters,
  areaId?: number,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "dashboard", company, areaId, filters],
    queryFn: () => getAccountsReceivableDashboard(company, filters, areaId),
  });
};

export const useFilterTree = (company: string = "deposito") => {
  return useQuery({
    queryKey: [QUERY_KEY, "filterTree"],
    queryFn: () => getFilterTree(company),
    staleTime: 5 * 60 * 1000,
  });
};
