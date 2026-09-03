import { PayrollCalculationStatus } from "./payroll-calculation.interface";

export const PAYROLL_CALCULATION_ENDPOINT = "/gp/gh/payroll/schedules";

export const PAYROLL_CALCULATION_QUERY_KEY = "payroll-calculations";
export const PAYROLL_CALCULATION_SUMMARY_QUERY_KEY = "payroll-calculations-summary";
export const PAYROLL_CALCULATION_REPORT_QUERY_KEY = "payroll-calculations-report";
export const PAYROLL_CALCULATION_REPORT_ENDPOINT = "/gp/gh/payroll/calculations/report";
export const PAYROLL_CALCULATION_EXPORT_ENDPOINT = "/gp/gh/payroll/calculations/export-summary";

// Histórico de conceptos variables (para completar meses anteriores al sistema)
export const PAYROLL_HISTORICAL_TEMPLATE_ENDPOINT = "/gp/gh/payroll/calculations/historical-template";
export const PAYROLL_HISTORICAL_IMPORT_ENDPOINT = "/gp/gh/payroll/calculations/historical-import";

// Histórico de bono/comisión (BONO_CONDUCTOR) — usado por el promedio de 6 meses de gratificación/CTS
export const PAYROLL_HISTORICAL_BONUS_TEMPLATE_ENDPOINT = "/gp/gh/payroll/calculations/historical-bonus-template";
export const PAYROLL_HISTORICAL_BONUS_IMPORT_ENDPOINT = "/gp/gh/payroll/calculations/historical-bonus-import";

// Histórico de sueldos (rrhh_contrato) — usado por gratificación/CTS para el sueldo vigente en cada fecha
export const PAYROLL_HISTORICAL_SALARY_TEMPLATE_ENDPOINT = "/gp/gh/payroll/calculations/historical-salary-template";
export const PAYROLL_HISTORICAL_SALARY_IMPORT_ENDPOINT = "/gp/gh/payroll/calculations/historical-salary-import";

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
