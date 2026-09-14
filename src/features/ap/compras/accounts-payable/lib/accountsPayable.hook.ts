import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ACCOUNTS_PAYABLE } from "./accountsPayable.constants";
import {
  getAccountsPayable,
  getAccountPayableById,
  getAccountsPayableDashboard,
} from "./accountsPayable.actions";
import type {
  AccountsPayableFilters,
  DashboardFilters,
} from "./accountsPayable.interface";

const { QUERY_KEY } = ACCOUNTS_PAYABLE;

export const useAccountsPayable = (filters: AccountsPayableFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getAccountsPayable(filters),
    placeholderData: keepPreviousData,
  });
};

export const useAccountPayableById = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => getAccountPayableById(id!),
    enabled: !!id,
  });
};

export const useAccountsPayableDashboard = (
  company: string,
  filters?: DashboardFilters,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "dashboard", company, filters],
    queryFn: () => getAccountsPayableDashboard(company, filters),
  });
};
