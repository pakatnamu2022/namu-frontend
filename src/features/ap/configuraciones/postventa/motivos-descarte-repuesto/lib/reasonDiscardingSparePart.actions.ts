import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { STATUS_ACTIVE } from "@/core/core.constants.ts";

import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { REASONS_DISCARDING_SPAREPART } from "./reasonDiscardingSparePart.constants.ts";
import {
  getReasonDiscardingSparePartProps,
  ReasonDiscardingSparePartResource,
  ReasonDiscardingSparePartResponse,
} from "./reasonDiscardingSparePart.interface.ts";

const { ENDPOINT } = REASONS_DISCARDING_SPAREPART;

export async function getReasonDiscardingSparePart({
  params,
}: getReasonDiscardingSparePartProps): Promise<ReasonDiscardingSparePartResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.DISCARDING_SPAREPART,
    },
  };
  const { data } = await api.get<ReasonDiscardingSparePartResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllReasonDiscardingSparePart({
  params,
}: getReasonDiscardingSparePartProps): Promise<
  ReasonDiscardingSparePartResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.DISCARDING_SPAREPART,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ReasonDiscardingSparePartResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findReasonDiscardingSparePartById(
  id: number
): Promise<ReasonDiscardingSparePartResource> {
  const response = await api.get<ReasonDiscardingSparePartResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeReasonDiscardingSparePart(
  data: any
): Promise<ReasonDiscardingSparePartResource> {
  const response = await api.post<ReasonDiscardingSparePartResource>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateReasonDiscardingSparePart(
  id: number,
  data: any
): Promise<ReasonDiscardingSparePartResource> {
  const response = await api.put<ReasonDiscardingSparePartResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteReasonDiscardingSparePart(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
