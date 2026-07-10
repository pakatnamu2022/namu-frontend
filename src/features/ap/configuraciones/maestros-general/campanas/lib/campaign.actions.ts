import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { CAMPAIGN } from "./campaign.constants";
import {
  CampaignResource,
  CampaignResponse,
  getActiveCampaignProps,
  getCampaignProps,
} from "./campaign.interface";

const { ENDPOINT } = CAMPAIGN;

export async function getCampaign({
  params,
}: getCampaignProps): Promise<CampaignResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<CampaignResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCampaign({
  params,
}: getCampaignProps): Promise<CampaignResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<CampaignResource[]>(ENDPOINT, config);
  return data;
}

export async function findCampaignById(id: number): Promise<CampaignResource> {
  const response = await api.get<CampaignResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeCampaign(data: any): Promise<CampaignResource> {
  const response = await api.post<CampaignResource>(ENDPOINT, data);
  return response.data;
}

export async function updateCampaign(
  id: number,
  data: any,
): Promise<CampaignResource> {
  const response = await api.put<CampaignResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteCampaign(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getActiveCampaign({
  params,
}: getActiveCampaignProps): Promise<CampaignResource | null> {
  const { data } = await api.get<CampaignResource | null>(
    `${ENDPOINT}/active`,
    { params: { ...params } },
  );
  return data;
}
