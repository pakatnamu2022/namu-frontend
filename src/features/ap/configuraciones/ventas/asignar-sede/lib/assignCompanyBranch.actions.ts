import type { AxiosRequestConfig } from "axios";
import {
  AssignCompanyBranchResource,
  AssignCompanyBranchResponse,
  getAssignCompanyBranchProps,
} from "./assignCompanyBranch.interface";
import { api } from "@/core/api";
import { ASSIGN_COMPANY_BRANCH } from "./assignCompanyBranch.constants";
import { WorkerResource } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.interface";

const { ENDPOINT } = ASSIGN_COMPANY_BRANCH;

export async function getAssignCompanyBranch({
  params,
}: getAssignCompanyBranchProps): Promise<AssignCompanyBranchResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AssignCompanyBranchResponse>(ENDPOINT, config);
  return data;
}

export async function findAssignCompanyBranchById(
  id: number
): Promise<AssignCompanyBranchResource> {
  const response = await api.get<AssignCompanyBranchResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAssignCompanyBranch(
  data: any
): Promise<AssignCompanyBranchResource> {
  const response = await api.post<AssignCompanyBranchResource>(ENDPOINT, data);
  return response.data;
}

export async function updateAssignCompanyBranch(
  id: number,
  data: any
): Promise<AssignCompanyBranchResource> {
  const response = await api.put<AssignCompanyBranchResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function getAllWorkersBySede(
  id: number
): Promise<WorkerResource[]> {
  const { data } = await api.get<WorkerResource[]>(`${ENDPOINT}/${id}/workers`);
  return data;
}
