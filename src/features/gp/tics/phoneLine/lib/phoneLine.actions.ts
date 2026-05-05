import { api } from "@/core/api";
import {
  PhoneLineResource,
  PhoneLineResponse,
  PhoneLineWorkerResource,
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

export async function assignPhoneLineWorker(
  phone_line_id: number,
  worker_id: number,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>("/gp/tics/phoneLineWorker", {
    phone_line_id,
    worker_id,
  });
  return data;
}

export async function getPhoneLineHistory(
  phoneLineId: number,
): Promise<PhoneLineWorkerResource[]> {
  const { data } = await api.get<PhoneLineWorkerResource[]>(
    `/gp/tics/phoneLineWorker/history/${phoneLineId}`,
  );
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
