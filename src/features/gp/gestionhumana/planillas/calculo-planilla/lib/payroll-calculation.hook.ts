import { useQuery } from "@tanstack/react-query";
import { getPayrollCalculationSummary } from "./payroll-calculation.actions";
import {
  PAYROLL_CALCULATION_SUMMARY_QUERY_KEY,
} from "./payroll-calculation.constant";
import { PayrollSummaryResponse } from "./payroll-calculation.interface";

export const usePayrollCalculationSummary = (periodId: number | null) => {
  return useQuery<PayrollSummaryResponse>({
    queryKey: [PAYROLL_CALCULATION_SUMMARY_QUERY_KEY, periodId],
    queryFn: () => getPayrollCalculationSummary(periodId!),
    enabled: periodId !== null && periodId !== undefined,
    refetchOnWindowFocus: false,
  });
};
