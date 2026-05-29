import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { LoanResource, LoanResponse } from "./loan.interface";
import { LOAN, LOAN_CONCEPT_TYPE } from "./loan.constant";
import { GENERAL_MASTERS_ENDPOINT } from "@/features/gp/lib/gp.constants";
import { GeneralMastersResource } from "@/features/gp/maestros-generales/lib/generalMasters.interface";

const { ENDPOINT } = LOAN;

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getLoans(
  params?: Record<string, any>,
): Promise<LoanResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<LoanResponse>(ENDPOINT, config);
  return data;
}

export async function findLoanById(id: number): Promise<LoanResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<LoanResource>(data);
}

export async function storeLoan(payload: any): Promise<LoanResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<LoanResource>(data);
}

export async function updateLoan(
  id: number,
  payload: any,
): Promise<LoanResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<LoanResource>(data);
}

export async function deleteLoan(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getLoanConcepts(): Promise<GeneralMastersResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: "true", type: LOAN_CONCEPT_TYPE },
  };
  const { data } = await api.get<GeneralMastersResource[]>(
    GENERAL_MASTERS_ENDPOINT,
    config,
  );
  return Array.isArray(data) ? data : (unwrap<GeneralMastersResource[]>(data) ?? []);
}
