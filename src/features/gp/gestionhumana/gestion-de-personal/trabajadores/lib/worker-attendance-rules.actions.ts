import { api } from "@/core/api.ts";

const ENDPOINT = "/gp/gh/payroll/workers";

export interface WorkerAttendanceRule {
  id: number;
  code: string;
  description: string;
  hour_type: string;
  hours: string;
  multiplier: number;
  pay: boolean;
  use_shift: boolean;
}

export interface WorkerAttendanceRulesResponse {
  has_restriction: boolean;
  rules: WorkerAttendanceRule[];
}

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getWorkerAttendanceRules(
  workerId: number,
): Promise<WorkerAttendanceRulesResponse> {
  const { data } = await api.get<any>(
    `${ENDPOINT}/${workerId}/attendance-rules`,
  );
  return unwrap<WorkerAttendanceRulesResponse>(data);
}

export async function syncWorkerAttendanceRules(
  workerId: number,
  codes: string[],
): Promise<WorkerAttendanceRulesResponse> {
  const { data } = await api.post<any>(
    `${ENDPOINT}/${workerId}/attendance-rules/sync`,
    { codes },
  );
  return unwrap<WorkerAttendanceRulesResponse>(data);
}

export async function deleteWorkerAttendanceRule(
  workerId: number,
  code: string,
): Promise<WorkerAttendanceRulesResponse> {
  const { data } = await api.delete<any>(
    `${ENDPOINT}/${workerId}/attendance-rules/${code}`,
  );
  return unwrap<WorkerAttendanceRulesResponse>(data);
}
