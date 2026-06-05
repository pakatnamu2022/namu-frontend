import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import type { LoanDetailResource, LoanExtraDiscountRequest, LoanExtraDiscountResource, LoanResource, LoanResponse } from "./loan.interface";
import { LOAN } from "./loan.constant";

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

export async function findLoanById(id: number): Promise<LoanDetailResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<LoanDetailResource>(data);
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

export async function storeLoanExtraDiscount(
  payload: LoanExtraDiscountRequest,
): Promise<LoanExtraDiscountResource> {
  const { data } = await api.post<any>("/gp/gh/payroll/loan-extra-discounts", payload);
  return unwrap<LoanExtraDiscountResource>(data);
}
