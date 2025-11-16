import { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { AP_GOAL_SELL_OUT_IN } from "./apGoalSellOutIn.constants";
import {
  ApGoalSellOutInReportResponse,
  ApGoalSellOutInResource,
  ApGoalSellOutInResponse,
  getApGoalSellOutInProps,
} from "./apGoalSellOutIn.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";

const { ENDPOINT } = AP_GOAL_SELL_OUT_IN;

export async function getApGoalSellOutIn({
  params,
}: getApGoalSellOutInProps): Promise<ApGoalSellOutInResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ApGoalSellOutInResponse>(ENDPOINT, config);
  return data;
}

export async function getApGoalSellOutInReport({
  params,
}: getApGoalSellOutInProps): Promise<ApGoalSellOutInReportResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ApGoalSellOutInReportResponse>(
    `${ENDPOINT}/report`,
    config
  );
  return data;
}

export async function downloadApGoalSellOutInReportPdf({
  params,
}: getApGoalSellOutInProps): Promise<void> {
  if (!params || !params.year || !params.month) {
    return;
  }

  try {
    const response = await api.get(
      `${ENDPOINT}/report/pdf?year=${params.year}&month=${params.month}`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `metas-${params.year}-${params.month}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}

export async function findApGoalSellOutInById(
  id: number
): Promise<ApGoalSellOutInResource> {
  const response = await api.get<ApGoalSellOutInResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeApGoalSellOutIn(
  data: any
): Promise<ApGoalSellOutInResource> {
  const response = await api.post<ApGoalSellOutInResource>(ENDPOINT, data);
  return response.data;
}

export async function updateApGoalSellOutIn(
  id: number,
  data: any
): Promise<ApGoalSellOutInResource> {
  const response = await api.put<ApGoalSellOutInResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteApGoalSellOutIn(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
