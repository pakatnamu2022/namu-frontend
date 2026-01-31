import { api } from "@/core/api";
import {
  PhoneLineResource,
  PhoneLineResponse,
  getPhoneLinesProps,
} from "./phoneLine.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { PHONE_LINE } from "./phoneLine.constants";

const { ENDPOINT } = PHONE_LINE;

export async function getPhoneLines({
  params,
}: getPhoneLinesProps): Promise<PhoneLineResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PhoneLineResponse>(ENDPOINT, config);
  return data;
}

export async function findPhoneLineById(
  id: number,
): Promise<PhoneLineResource> {
  const response = await api.get<PhoneLineResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePhoneLine(data: any): Promise<PhoneLineResponse> {
  const response = await api.post<PhoneLineResponse>(ENDPOINT, data);
  return response.data;
}

export async function updatePhoneLine(
  id: number,
  data: any,
): Promise<PhoneLineResponse> {
  const response = await api.put<PhoneLineResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deletePhoneLine(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getAllTelephoneAccounts(): Promise<any[]> {
  const config: AxiosRequestConfig = { params: { all: true } };
  const { data } = await api.get<any[]>("/gp/tics/telephoneAccount", config);
  return data;
}

export async function getAllTelephonePlans(): Promise<any[]> {
  const config: AxiosRequestConfig = { params: { all: true } };
  const { data } = await api.get<any[]>("/gp/tics/telephonePlan", config);
  return data;
}

export async function importPhoneLines(file: File): Promise<GeneralResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
}
