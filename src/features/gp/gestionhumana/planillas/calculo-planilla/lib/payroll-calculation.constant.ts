import { PayrollCalculationStatus } from "./payroll-calculation.interface";

export const PAYROLL_CALCULATION_ENDPOINT = "/gp/gh/payroll/schedules";

export const PAYROLL_CALCULATION_QUERY_KEY = "payroll-calculations";
export const PAYROLL_CALCULATION_SUMMARY_QUERY_KEY = "payroll-calculations-summary";

export const CALCULATION_STATUS_CONFIG: Record<
  PayrollCalculationStatus,
  { label: string; color: "default" | "secondary" | "destructive" | "muted" | "success" | "warning" }
> = {
  DRAFT: { label: "Borrador", color: "muted" },
  CALCULATED: { label: "Calculado", color: "secondary" },
  APPROVED: { label: "Aprobado", color: "success" },
  PAID: { label: "Pagado", color: "default" },
};

export const DETAIL_TYPE_CONFIG: Record<
  string,
  { label: string; sign: "+" | "-" | "~" }
> = {
  EARNING: { label: "Ingreso", sign: "+" },
  DEDUCTION: { label: "Descuento", sign: "-" },
  CONTRIBUTION: { label: "Aporte Patronal", sign: "~" },
};
