import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import { FamilyAllowanceRequest, FamilyAllowanceResponse } from "./family-allowance.interface";
import { FAMILY_ALLOWANCE } from "./family-allowance.constant";

const { ENDPOINT } = FAMILY_ALLOWANCE;

export async function getFamilyAllowances(
  params?: Record<string, any>,
): Promise<FamilyAllowanceResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<FamilyAllowanceResponse>(ENDPOINT, config);
  return data;
}

export async function storeOrUpdateFamilyAllowance(
  payload: FamilyAllowanceRequest,
): Promise<void> {
  await api.post(ENDPOINT, payload);
}
