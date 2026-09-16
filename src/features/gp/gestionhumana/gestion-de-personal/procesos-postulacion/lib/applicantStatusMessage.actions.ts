import { api } from "@/core/api.ts";
import {
  ApplicantStatusMessageResource,
  UpdateApplicantStatusMessagePayload,
} from "./applicantStatusMessage.interface.ts";

const ENDPOINT = "/gp/gh/reclutamiento/applicant-status-message";

export async function getApplicantStatusMessages(): Promise<
  ApplicantStatusMessageResource[]
> {
  const { data } = await api.get<ApplicantStatusMessageResource[]>(ENDPOINT);
  return data;
}

export async function updateApplicantStatusMessage(
  tipoTrabajadorId: number,
  payload: UpdateApplicantStatusMessagePayload,
): Promise<ApplicantStatusMessageResource> {
  const { data } = await api.put<ApplicantStatusMessageResource>(
    `${ENDPOINT}/${tipoTrabajadorId}`,
    payload,
  );
  return data;
}
