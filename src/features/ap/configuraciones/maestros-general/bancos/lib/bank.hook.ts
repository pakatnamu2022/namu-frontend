import { useQuery } from "@tanstack/react-query";
import { BankResource, BankResponse } from "./bank.interface";
import { findBankById, getAllBank, getBank } from "./bank.actions";
import { BANK } from "./bank.constants";

const { QUERY_KEY } = BANK;

export const useBank = (params?: Record<string, any>) => {
  return useQuery<BankResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getBank({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllBank = (params?: Record<string, any>) => {
  return useQuery<BankResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllBank({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useBankById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBankById(id),
    refetchOnWindowFocus: false,
  });
};
