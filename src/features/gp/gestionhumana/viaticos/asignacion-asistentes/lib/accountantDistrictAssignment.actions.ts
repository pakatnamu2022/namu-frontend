import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ACCOUNTANT_DISTRICT_ASSIGNMENT } from "./accountantDistrictAssignment.constants";
import {
  getAccountantDistrictAssignmentProps,
  AccountantDistrictAssignmentRequest,
  AccountantDistrictAssignmentResource,
  AccountantDistrictAssignmentResponse,
} from "./accountantDistrictAssignment.interface";

const { ENDPOINT } = ACCOUNTANT_DISTRICT_ASSIGNMENT;

export async function getAccountantDistrictAssignment({
  params,
}: getAccountantDistrictAssignmentProps): Promise<AccountantDistrictAssignmentResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<AccountantDistrictAssignmentResponse>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function getAllAccountantDistrictAssignment({
  params,
}: getAccountantDistrictAssignmentProps): Promise<
  AccountantDistrictAssignmentResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<AccountantDistrictAssignmentResource[]>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function findAccountantDistrictAssignmentById(
  id: number,
): Promise<AccountantDistrictAssignmentResource> {
  const response = await api.get<AccountantDistrictAssignmentResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeAccountantDistrictAssignment(
  data: AccountantDistrictAssignmentRequest,
): Promise<AccountantDistrictAssignmentResource> {
  const response = await api.post<AccountantDistrictAssignmentResource>(
    ENDPOINT,
    data,
  );
  return response.data;
}

export async function updateAccountantDistrictAssignment(
  id: number,
  data: AccountantDistrictAssignmentRequest,
): Promise<AccountantDistrictAssignmentResource> {
  const response = await api.put<AccountantDistrictAssignmentResource>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteAccountantDistrictAssignment(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
