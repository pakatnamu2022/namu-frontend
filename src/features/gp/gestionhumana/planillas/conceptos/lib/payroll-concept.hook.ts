import { useQuery } from "@tanstack/react-query";
import {
  PayrollConceptResource,
  PayrollConceptResponse,
} from "./payroll-concept.interface";
import {
  getAllPayrollConcepts,
  getPayrollConcepts,
} from "./payroll-concept.actions";
import { PAYROLL_CONCEPT } from "./payroll-concept.constant";

const { QUERY_KEY } = PAYROLL_CONCEPT;

export const usePayrollConcepts = (params?: Record<string, unknown>) => {
  return useQuery<PayrollConceptResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPayrollConcepts({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPayrollConcepts = () => {
  return useQuery<PayrollConceptResource[]>({
    queryKey: [`${QUERY_KEY}-all`],
    queryFn: () => getAllPayrollConcepts(),
    refetchOnWindowFocus: false,
  });
};
