import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import { PayrollRegisterResponse } from "./payroll-register.interface";
import { PAYROLL_REGISTER } from "./payroll-register.constant";

const { ENDPOINT } = PAYROLL_REGISTER;

export async function getPayrollRegister(
  params?: Record<string, any>,
): Promise<PayrollRegisterResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<PayrollRegisterResponse>(ENDPOINT, config);
  return data;
}

export async function generatePayrollRegister(payload: {
  company_id: number;
  period_id: number;
}): Promise<void> {
  await api.post(`${ENDPOINT}/generate`, payload);
}

export async function exportPayrollRegister(period_id: number): Promise<Blob> {
  const { data } = await api.post<Blob>(
    `${ENDPOINT}/export`,
    { period_id },
    { responseType: "blob" },
  );
  return data;
}
