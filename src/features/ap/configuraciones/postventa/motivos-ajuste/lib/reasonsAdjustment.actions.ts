import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { STATUS_ACTIVE } from "@/core/core.constants.ts";
import {
  getReasonsAdjustmentProps,
  ReasonsAdjustmentResource,
  ReasonsAdjustmentResponse,
} from "./reasonsAdjustment.interface.ts";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { REASONS_ADJUSTMENT } from "./reasonsAdjustment.constants.ts";

const { ENDPOINT } = REASONS_ADJUSTMENT;

export async function getReasonsAdjustment({
  params,
}: getReasonsAdjustmentProps): Promise<ReasonsAdjustmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: [
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT,
      ],
    },
  };
  const { data } = await api.get<ReasonsAdjustmentResponse>(ENDPOINT, config);
  return data;
}

export async function getAllReasonsAdjustment({
  params,
}: getReasonsAdjustmentProps): Promise<ReasonsAdjustmentResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: [
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT,
      ],
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ReasonsAdjustmentResource[]>(ENDPOINT, config);
  return data;
}

export async function findReasonsAdjustmentById(
  id: number
): Promise<ReasonsAdjustmentResource> {
  const response = await api.get<ReasonsAdjustmentResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeReasonsAdjustment(
  data: any
): Promise<ReasonsAdjustmentResource> {
  const response = await api.post<ReasonsAdjustmentResource>(ENDPOINT, data);
  return response.data;
}

export async function updateReasonsAdjustment(
  id: number,
  data: any
): Promise<ReasonsAdjustmentResource> {
  const response = await api.put<ReasonsAdjustmentResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteReasonsAdjustment(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
