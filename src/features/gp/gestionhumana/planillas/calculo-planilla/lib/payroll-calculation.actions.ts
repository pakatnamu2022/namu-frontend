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
 * GET /schedules/summary/{periodId}
 * Obtiene el preview de cálculos sin guardarlos
 */
export async function getPayrollCalculationSummary(
  periodId: number,
): Promise<PayrollSummaryResponse> {
  const { data } = await api.get<PayrollSummaryResponse>(
    `${PAYROLL_CALCULATION_ENDPOINT}/summary/${periodId}`,
  );
  return data;
}

/**
 * POST /schedules/generate-calculations/{periodId}
 * Genera y guarda los cálculos en BD
 */
export async function generatePayrollCalculations(
  periodId: number,
): Promise<GenerateCalculationsResponse> {
  const { data } = await api.post<GenerateCalculationsResponse>(
    `${PAYROLL_CALCULATION_ENDPOINT}/generate-calculations/${periodId}`,
  );
  return data;
}

/**
 * POST /schedules/recalculate-calculations/{periodId}
 * Elimina y regenera los cálculos existentes
 */
export async function recalculatePayrollCalculations(
  periodId: number,
): Promise<GenerateCalculationsResponse> {
  const { data } = await api.post<GenerateCalculationsResponse>(
    `${PAYROLL_CALCULATION_ENDPOINT}/recalculate-calculations/${periodId}`,
  );
  return data;
}

/**
 * GET /calculations/report/{periodId}
 * Retorna el reporte consolidado de nómina por trabajador
 */
export async function getPayrollReport(
  periodId: number,
): Promise<PayrollReportData> {
  const { data } = await api.get<PayrollReportData>(
    `${PAYROLL_CALCULATION_REPORT_ENDPOINT}/${periodId}`,
  );
  return data;
}

/**
 * GET /schedules/attendances/{periodId}
 * Retorna las asistencias día a día de todos los trabajadores del período
 */
export async function getPayrollAttendances(
  periodId: number,
): Promise<AttendancesData> {
  const { data } = await api.get<AttendancesData>(
    `${PAYROLL_CALCULATION_ENDPOINT}/attendances/${periodId}`,
  );
  return data;
}
