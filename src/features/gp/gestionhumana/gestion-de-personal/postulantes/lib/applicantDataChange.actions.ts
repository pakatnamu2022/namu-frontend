import { api } from "@/core/api.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getApplicantDataChangesProps,
  ApplicantDataChangeResource,
  ApplicantDataChangeResponse,
} from "./applicantDataChange.interface.ts";
import { APPLICANT_DATA_CHANGE } from "./applicantDataChange.constant.ts";

const { ENDPOINT } = APPLICANT_DATA_CHANGE;

export async function getApplicantDataChanges({
  params,
}: getApplicantDataChangesProps): Promise<ApplicantDataChangeResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ApplicantDataChangeResponse>(ENDPOINT, config);
  return data;
}

export async function approveApplicantDataChange(
  id: number,
): Promise<{ data: ApplicantDataChangeResource }> {
  const { data } = await api.post<{ data: ApplicantDataChangeResource }>(
    `${ENDPOINT}/${id}/approve`,
  );
  return data;
}

export async function rejectApplicantDataChange(
  id: number,
  motivo: string,
): Promise<{ data: ApplicantDataChangeResource }> {
  const { data } = await api.post<{ data: ApplicantDataChangeResource }>(
    `${ENDPOINT}/${id}/reject`,
    { motivo },
  );
  return data;
}
