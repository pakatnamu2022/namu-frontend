import { useQuery } from "@tanstack/react-query";
import { LoanResource, LoanResponse } from "./loan.interface";
import { findLoanById, getLoans } from "./loan.actions";
import { LOAN } from "./loan.constant";

const { QUERY_KEY } = LOAN;

export const useLoans = (params?: Record<string, any>) => {
  return useQuery<LoanResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getLoans(params),
    refetchOnWindowFocus: false,
  });
};

export const useLoanById = (id: number) => {
  return useQuery<LoanResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findLoanById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
