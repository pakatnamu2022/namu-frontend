import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { STATUS_ACTIVE } from "@/core/core.constants.ts";

import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import {
  getReasonDiscardingTallerProps,
  ReasonDiscardingTallerResource,
  ReasonDiscardingTallerResponse,
} from "./reasonDiscardingTaller.interface.ts";
import { REASONS_DISCARDING_TALLER } from "./reasonDiscardingTaller.constants.ts";

const { ENDPOINT } = REASONS_DISCARDING_TALLER;

export async function getReasonDiscardingTaller({
  params,
}: getReasonDiscardingTallerProps): Promise<ReasonDiscardingTallerResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.DISCARDING_TALLER,
    },
  };
  const { data } = await api.get<ReasonDiscardingTallerResponse>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function getAllReasonDiscardingTaller({
  params,
}: getReasonDiscardingTallerProps): Promise<ReasonDiscardingTallerResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.DISCARDING_TALLER,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ReasonDiscardingTallerResource[]>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function findReasonDiscardingTallerById(
  id: number,
): Promise<ReasonDiscardingTallerResource> {
  const response = await api.get<ReasonDiscardingTallerResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeReasonDiscardingTaller(
  data: any,
): Promise<ReasonDiscardingTallerResource> {
  const response = await api.post<ReasonDiscardingTallerResource>(
    ENDPOINT,
    data,
  );
  return response.data;
}

export async function updateReasonDiscardingTaller(
  id: number,
  data: any,
): Promise<ReasonDiscardingTallerResource> {
  const response = await api.put<ReasonDiscardingTallerResource>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteReasonDiscardingTaller(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
