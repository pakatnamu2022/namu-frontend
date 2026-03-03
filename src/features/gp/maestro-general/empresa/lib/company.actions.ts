import { api } from "@/core/api.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getCompanysProps,
  CompanyResource,
  CompanyResponse,
} from "./company.interface.ts";

export async function getCompany({
  params,
}: getCompanysProps): Promise<CompanyResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<CompanyResponse>("/company", config);
  return data;
}

export async function getAllCompanies(): Promise<CompanyResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<CompanyResource[]>("/company", config);
  return data;
}

export async function findCompanyById(id: number): Promise<CompanyResource> {
  const { data } = await api.get<CompanyResource>(`/company/${id}`);
  return data;
}

export async function storeCompany(data: any): Promise<CompanyResponse> {
  const response = await api.post<CompanyResponse>("/company", data);
  return response.data;
}

export async function updateCompany(
  id: number,
  data: any
): Promise<CompanyResource> {
  const response = await api.put<CompanyResource>(`/company/${id}`, data);
  return response.data;
}

export async function deleteCompany(id: number): Promise<void> {
  await api.delete(`/company/${id}`);
}
