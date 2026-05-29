import { api } from "@/core/api";
import { ATTENDANCE } from "./attendance.constants";
import type {
  AttendanceResponse,
  AttendanceRecord,
  AttendanceFilters,
  AttendanceSyncResponse,
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
