import { api } from "@/core/api";
import {
  AttendancesData,
  GenerateCalculationsResponse,
  HistoricalImportResponse,
  HistoricalPeriodInput,
  PayrollReportData,
  PayrollSummaryResponse,
} from "./payroll-calculation.interface";
import {
  PAYROLL_CALCULATION_ENDPOINT,
  PAYROLL_CALCULATION_EXPORT_ENDPOINT,
  PAYROLL_CALCULATION_REPORT_ENDPOINT,
  PAYROLL_HISTORICAL_IMPORT_ENDPOINT,
  PAYROLL_HISTORICAL_TEMPLATE_ENDPOINT,
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
 * GET /calculations/export-summary/{periodId}?biweekly=1|2
 * Descarga el Excel de nómina (3 hojas) y lo ofrece al navegador
 */
export async function exportPayrollExcel(
  periodId: number,
  periodCode: string,
  quincena?: 1 | 2 | null,
): Promise<void> {
  const params = quincena ? { biweekly: quincena } : undefined;
  const { data } = await api.get(
    `${PAYROLL_CALCULATION_EXPORT_ENDPOINT}/${periodId}`,
    { params, responseType: "blob" },
  );
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `planilla-${periodCode}${quincena ? `-q${quincena}` : ""}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
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

/**
 * GET /calculations/historical-template?company_id=&periods[]=YYYY-MM
 * Descarga la plantilla para cargar el histórico de conceptos variables mensuales
 * (horas extra, feriado, DDT, bonif. nocturna) de meses anteriores al sistema.
 */
export async function downloadHistoricalTemplate(
  companyId: number,
  periods: HistoricalPeriodInput[],
): Promise<void> {
  const { data } = await api.get(PAYROLL_HISTORICAL_TEMPLATE_ENDPOINT, {
    params: {
      company_id: companyId,
      periods: periods.map(
        (p) => `${p.year}-${String(p.month).padStart(2, "0")}`,
      ),
    },
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historico-conceptos-variables.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * POST /calculations/historical-import (multipart: file, company_id)
 * Sube el Excel con el histórico de conceptos variables mensuales (mismo formato
 * que downloadHistoricalTemplate) y lo registra en gh_payroll_calculations.
 */
export async function importHistoricalCalculations(
  file: File,
  companyId: number,
): Promise<HistoricalImportResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("company_id", String(companyId));
  const { data } = await api.post<HistoricalImportResponse>(
    PAYROLL_HISTORICAL_IMPORT_ENDPOINT,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
