import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  GetPayrollConceptsProps,
  PayrollConceptResource,
  PayrollConceptResponse,
} from "./payroll-concept.interface";
import { PAYROLL_CONCEPT } from "./payroll-concept.constant";
import { PayrollConceptSchema } from "./payroll-concept.schema";

const { ENDPOINT } = PAYROLL_CONCEPT;

export async function getPayrollConcepts({
  params,
}: GetPayrollConceptsProps): Promise<PayrollConceptResponse> {
  const config: AxiosRequestConfig = {
    params: { ...params },
  };
  const { data } = await api.get<PayrollConceptResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPayrollConcepts(): Promise<
  PayrollConceptResource[]
> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<PayrollConceptResource[]>(ENDPOINT, config);
  return data;
}

export async function findPayrollConceptById(
  id: string
): Promise<PayrollConceptResource> {
  const response = await api.get<PayrollConceptResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePayrollConcept(
  payload: PayrollConceptSchema
): Promise<PayrollConceptResponse> {
  const response = await api.post<PayrollConceptResponse>(ENDPOINT, payload);
  return response.data;
}

export async function updatePayrollConcept(
  id: string,
  payload: PayrollConceptSchema
): Promise<PayrollConceptResponse> {
  const response = await api.put<PayrollConceptResponse>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return response.data;
}

export async function deletePayrollConcept(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
