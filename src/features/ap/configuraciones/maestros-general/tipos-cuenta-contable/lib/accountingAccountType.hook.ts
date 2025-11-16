import { useQuery } from "@tanstack/react-query";
import {
  findAccountingAccountTypeById,
  getAccountingAccountType,
  getAllAccountingAccountType,
} from "./accountingAccountType.actions";
import {
  AccountingAccountTypeResource,
  AccountingAccountTypeResponse,
} from "./accountingAccountType.interface";
import { ACCOUNTING_ACCOUNT_TYPE } from "./accountingAccountType.constants";

const { QUERY_KEY } = ACCOUNTING_ACCOUNT_TYPE;

export const useAccountingAccountType = (params?: Record<string, any>) => {
  return useQuery<AccountingAccountTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAccountingAccountType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllAccountingAccountType = (params?: Record<string, any>) => {
  return useQuery<AccountingAccountTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllAccountingAccountType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAccountingAccountTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAccountingAccountTypeById(id),
    refetchOnWindowFocus: false,
  });
};
