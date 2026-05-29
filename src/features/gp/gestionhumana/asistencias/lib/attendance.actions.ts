import { api } from "@/core/api";
import { ATTENDANCE } from "./attendance.constants";
import type {
  AttendanceResponse,
  AttendanceRecord,
  AttendanceFilters,
  AttendanceSyncResponse,
  AttendanceSyncRangePayload,
  AttendanceSyncRangeResponse,
  AttendanceReportFilters,
  AttendanceInternalResponse,
  AttendanceSunafilResponse,
  AttendanceSunafilFilters,
  AttendancePersonDashboard,
} from "./attendance.interface";

const { ENDPOINT } = ATTENDANCE;

export async function getAttendanceRecords(
  filters: AttendanceFilters,
): Promise<AttendanceResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params[key] = value;
    }
  });
  const { data } = await api.get<AttendanceResponse>(ENDPOINT, { params });
  return data;
}

export async function getAttendanceById(id: number): Promise<AttendanceRecord> {
  const { data } = await api.get<AttendanceRecord>(`${ENDPOINT}/${id}`);
  return data;
}

export async function syncAttendance(): Promise<AttendanceSyncResponse> {
  const { data } = await api.post<AttendanceSyncResponse>(`${ENDPOINT}/sync`);
  return data;
}

export async function syncAttendanceRange(
  payload: AttendanceSyncRangePayload,
): Promise<AttendanceSyncRangeResponse> {
  const { data } = await api.post<AttendanceSyncRangeResponse>(
    `${ENDPOINT}/sync-range`,
    payload,
  );
  return data;
}

async function downloadBlob(
  endpoint: string,
  params: Record<string, any>,
  filename: string,
): Promise<void> {
  const response = await api.get(endpoint, { params, responseType: "blob" });
  const url = URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportSunafilReport(
  filters: AttendanceReportFilters,
  format: "csv" | "xlsx",
): Promise<void> {
  const filename = `sunafil_${filters.date_from}_${filters.date_to}.${format}`;
  await downloadBlob(`${ENDPOINT}/report/sunafil`, { ...filters, export: format }, filename);
}

export async function exportInternalReport(
  filters: AttendanceReportFilters,
): Promise<void> {
  const filename = `reporte_interno_${filters.date_from}_${filters.date_to}.xlsx`;
  await downloadBlob(`${ENDPOINT}/report/internal`, { ...filters, export: "xlsx" }, filename);
}

export async function getSunafilReport(
  filters: AttendanceSunafilFilters,
): Promise<AttendanceSunafilResponse> {
  const { data } = await api.get<AttendanceSunafilResponse>(`${ENDPOINT}/report/sunafil`, {
    params: filters,
  });
  return data;
}

export async function getInternalReport(
  filters: AttendanceReportFilters,
): Promise<AttendanceInternalResponse> {
  const { data } = await api.get<AttendanceInternalResponse>(`${ENDPOINT}/report/internal`, {
    params: filters,
  });
  return data;
}

export async function getAttendancePersonDashboard(
  personId: number,
  filters: Partial<AttendanceReportFilters>,
): Promise<AttendancePersonDashboard> {
  const { data } = await api.get<AttendancePersonDashboard>(
    `${ENDPOINT}/person/${personId}`,
    { params: filters },
  );
  return data;
}
