import { api } from "@/core/api";
import {
  AttendancesData,
  GenerateCalculationsResponse,
  PayrollReportData,
  PayrollSummaryResponse,
} from "./payroll-calculation.interface";
import {
  PAYROLL_CALCULATION_ENDPOINT,
  PAYROLL_CALCULATION_REPORT_ENDPOINT,
} from "./payroll-calculation.constant";

/**
 * GET /schedules/summary/{periodId}?quincena=1|2
 * Obtiene el preview de cálculos sin guardarlos
 */
export async function getPayrollCalculationSummary(
  periodId: number,
  quincena?: 1 | 2 | null,
): Promise<PayrollSummaryResponse> {
  const params = quincena ? { biweekly: quincena } : undefined;
  const { data } = await api.get<PayrollSummaryResponse>(
    `${PAYROLL_CALCULATION_ENDPOINT}/summary/${periodId}`,
    { params },
  );
  return data;
}

/**
 * POST /schedules/generate-calculations/{periodId}?biweekly=1|2
 * Genera y guarda los cálculos en BD
 */
export async function generatePayrollCalculations(
  periodId: number,
  quincena?: 1 | 2 | null,
): Promise<GenerateCalculationsResponse> {
  const params = quincena ? { biweekly: quincena } : undefined;
  const { data } = await api.post<GenerateCalculationsResponse>(
    `${PAYROLL_CALCULATION_ENDPOINT}/generate-calculations/${periodId}`,
    undefined,
    { params },
  );
  return data;
}

/**
 * POST /schedules/recalculate-calculations/{periodId}?biweekly=1|2
 * Elimina y regenera los cálculos existentes
 */
export async function recalculatePayrollCalculations(
  periodId: number,
  quincena?: 1 | 2 | null,
): Promise<GenerateCalculationsResponse> {
  const params = quincena ? { biweekly: quincena } : undefined;
  const { data } = await api.post<GenerateCalculationsResponse>(
    `${PAYROLL_CALCULATION_ENDPOINT}/recalculate-calculations/${periodId}`,
    undefined,
    { params },
  );
  return data;
}

/**
 * GET /calculations/report/{periodId}?biweekly=1|2
 * Retorna el reporte consolidado de nómina por trabajador
 */
export async function getPayrollReport(
  periodId: number,
  quincena?: 1 | 2 | null,
): Promise<PayrollReportData> {
  const params = quincena ? { biweekly: quincena } : undefined;
  const { data } = await api.get<PayrollReportData>(
    `${PAYROLL_CALCULATION_REPORT_ENDPOINT}/${periodId}`,
    { params },
  );
  return data;
}

/**
 * GET /schedules/attendances/{periodId}?biweekly=1|2
 * Retorna las asistencias día a día de todos los trabajadores del período
 */
export async function getPayrollAttendances(
  periodId: number,
  quincena?: 1 | 2 | null,
): Promise<AttendancesData> {
  const params = quincena ? { biweekly: quincena } : undefined;
  const { data } = await api.get<AttendancesData>(
    `${PAYROLL_CALCULATION_ENDPOINT}/attendances/${periodId}`,
    { params },
  );
  return data;
}
