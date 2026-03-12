import { useQuery } from "@tanstack/react-query";
import { getPayrollAttendances, getPayrollCalculationSummary, getPayrollReport } from "./payroll-calculation.actions";
import {
  PAYROLL_CALCULATION_SUMMARY_QUERY_KEY,
  PAYROLL_CALCULATION_REPORT_QUERY_KEY,
} from "./payroll-calculation.constant";
import { PayrollSummaryResponse, AttendancesData, PayrollReportData } from "./payroll-calculation.interface";

export const usePayrollCalculationSummary = (
  periodId: number | null,
  quincena?: 1 | 2 | null,
) => {
  return useQuery<PayrollSummaryResponse>({
    queryKey: [PAYROLL_CALCULATION_SUMMARY_QUERY_KEY, periodId, quincena ?? null],
    queryFn: () => getPayrollCalculationSummary(periodId!, quincena),
    enabled: periodId !== null && periodId !== undefined,
    refetchOnWindowFocus: false,
  });
};

export const usePayrollReport = (
  periodId: number | null,
  quincena?: 1 | 2 | null,
) => {
  return useQuery<PayrollReportData>({
    queryKey: [PAYROLL_CALCULATION_REPORT_QUERY_KEY, periodId, quincena ?? null],
    queryFn: () => getPayrollReport(periodId!, quincena),
    enabled: periodId !== null && periodId !== undefined,
    refetchOnWindowFocus: false,
  });
};

export const usePayrollAttendances = (
  periodId: number | null,
  quincena?: 1 | 2 | null,
) => {
  return useQuery<AttendancesData>({
    queryKey: ["payroll-attendances", periodId, quincena ?? null],
    queryFn: () => getPayrollAttendances(periodId!, quincena),
    enabled: periodId !== null && periodId !== undefined,
    refetchOnWindowFocus: false,
  });
};
