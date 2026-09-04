import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getApplicantsProps,
  ApplicantResource,
  ApplicantResponse,
} from "./applicant.interface.ts";
import { APPLICANT } from "./applicant.constant.ts";

const { ENDPOINT } = APPLICANT;

function toFormData(payload: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    fd.append(key, value as string | Blob);
  });
  return fd;
}

export async function getApplicants({
  params,
}: getApplicantsProps): Promise<ApplicantResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ApplicantResponse>(ENDPOINT, config);
  return data;
}

export async function findApplicantById(
  id: string,
): Promise<ApplicantResource> {
  const { data } = await api.get<{ data: ApplicantResource }>(
    `${ENDPOINT}/${id}`,
  );
  return data.data;
}

export async function storeApplicant(
  payload: Record<string, any>,
): Promise<{ data: ApplicantResource }> {
  const { data } = await api.post<{ data: ApplicantResource }>(
    ENDPOINT,
    toFormData(payload),
  );
  return data;
}

export async function updateApplicant(
  id: string,
  payload: Record<string, any>,
): Promise<{ data: ApplicantResource }> {
  const { data } = await api.post<{ data: ApplicantResource }>(
    `${ENDPOINT}/${id}`,
    toFormData({ ...payload, _method: "PUT" }),
  );
  return data;
}

export async function changeApplicantStatus(
  id: number,
  payload: Record<string, any>,
): Promise<{ data: ApplicantResource }> {
  const { data } = await api.post<{ data: ApplicantResource }>(
    `${ENDPOINT}/${id}/status`,
    payload,
  );
  return data;
}

export async function deleteApplicant(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
