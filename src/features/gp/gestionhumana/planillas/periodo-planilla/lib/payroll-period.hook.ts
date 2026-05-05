import { useQuery } from "@tanstack/react-query";
import { PayrollPeriodResource, PayrollPeriodResponse } from "./payroll-period.interface";
import { getAllPayrollPeriods, getCurrentPayrollPeriod, findPayrollPeriodById, getPayrollPeriods } from "./payroll-period.actions";
import { PAYROLL_PERIOD } from "./payroll-period.constant";

const { QUERY_KEY } = PAYROLL_PERIOD;

export const usePayrollPeriods = (params?: Record<string, any>) => {
  return useQuery<PayrollPeriodResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPayrollPeriods({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPayrollPeriods = () => {
  return useQuery<PayrollPeriodResource[]>({
    queryKey: [`${QUERY_KEY}-all`],
    queryFn: () => getAllPayrollPeriods(),
    refetchOnWindowFocus: false,
  });
};

export const useFindPayrollPeriodById = (id: number) => {
  return useQuery<PayrollPeriodResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPayrollPeriodById(String(id)),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useCurrentPayrollPeriod = () => {
  return useQuery<PayrollPeriodResource>({
    queryKey: [`${QUERY_KEY}-current`],
    queryFn: () => getCurrentPayrollPeriod(),
    refetchOnWindowFocus: false,
    retry: false,
  });
};
