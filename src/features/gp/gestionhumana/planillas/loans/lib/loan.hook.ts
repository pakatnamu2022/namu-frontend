import { useQuery } from "@tanstack/react-query";
import { LoanResource, LoanResponse } from "./loan.interface";
import {
  findLoanById,
  getLoanConcepts,
  getLoans,
} from "./loan.actions";
import { LOAN, LOAN_CONCEPT_TYPE } from "./loan.constant";
import { GeneralMastersResource } from "@/features/gp/maestros-generales/lib/generalMasters.interface";

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

export const useLoanConcepts = () => {
  return useQuery<GeneralMastersResource[]>({
    queryKey: [`${QUERY_KEY}-concepts-${LOAN_CONCEPT_TYPE}`],
    queryFn: getLoanConcepts,
    refetchOnWindowFocus: false,
  });
};
