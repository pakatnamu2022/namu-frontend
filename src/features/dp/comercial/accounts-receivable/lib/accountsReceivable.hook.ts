import { useQuery } from "@tanstack/react-query";
import { ACCOUNTS_RECEIVABLE } from "./accountsReceivable.constants";
import {
  getAccountsReceivable,
  getAccountReceivableById,
  getFilterTree,
} from "./accountsReceivable.actions";
import type { AccountsReceivableFilters } from "./accountsReceivable.interface";

const { QUERY_KEY } = ACCOUNTS_RECEIVABLE;

export const useAccountsReceivable = (filters: AccountsReceivableFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getAccountsReceivable(filters),
    refetchOnWindowFocus: false,
  });
};

export const useAccountReceivableById = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => getAccountReceivableById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useFilterTree = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "filterTree"],
    queryFn: getFilterTree,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
