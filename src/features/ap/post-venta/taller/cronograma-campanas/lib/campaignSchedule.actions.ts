import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getCampaignScheduleProps,
  CampaignScheduleResource,
  CampaignScheduleResponse,
  CampaignScheduleRequest,
  CampaignScheduleStoreResponse,
  WorkerScheduleResponse,
  GetWorkerScheduleParams,
} from "./campaignSchedule.interface";
import { CAMPAIGN_SCHEDULE } from "./campaignSchedule.constants";

const { ENDPOINT } = CAMPAIGN_SCHEDULE;

export async function getCampaignSchedule({
  params,
}: getCampaignScheduleProps): Promise<CampaignScheduleResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<CampaignScheduleResponse>(ENDPOINT, config);
  return data;
}

export async function findCampaignScheduleById(
  id: number,
): Promise<CampaignScheduleResource> {
  const response = await api.get<CampaignScheduleResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeCampaignSchedule(
  data: CampaignScheduleRequest,
): Promise<CampaignScheduleStoreResponse> {
  const response = await api.post<CampaignScheduleStoreResponse>(
    ENDPOINT,
    data,
  );
  return response.data;
}

export async function deleteCampaignSchedule(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getWorkerSchedule(
  params: GetWorkerScheduleParams,
): Promise<WorkerScheduleResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<WorkerScheduleResponse>(
    `${ENDPOINT}/worker-schedule`,
    config,
  );
  return data;
}
