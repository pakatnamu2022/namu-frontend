import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  getCompanysProps,
  CompanyResource,
  CompanyResponse,
} from "./company.interface";

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

export async function storeCompany(data: any): Promise<CompanyResponse> {
  const response = await api.post<CompanyResponse>("/company", data);
  return response.data;
}
