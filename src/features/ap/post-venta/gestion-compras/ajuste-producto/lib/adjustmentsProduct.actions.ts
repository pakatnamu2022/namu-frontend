import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import {
  getAdjustmentsProductProps,
  AdjustmentsProductRequest,
  AdjustmentsProductResource,
  AdjustmentsProductResponse,
} from "./adjustmentsProduct.interface.ts";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants.ts";
import { ADJUSTMENT } from "./adjustmentsProduct.constants.ts";

const { ENDPOINT } = ADJUSTMENT;

export async function getAdjustmentsProduct({
  params,
}: getAdjustmentsProductProps): Promise<AdjustmentsProductResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      movement_type: [
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT,
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
      ],
    },
  };
  const { data } = await api.get<AdjustmentsProductResponse>(ENDPOINT, config);
  return data;
}

export async function getAllAdjustmentsProduct({
  params,
}: getAdjustmentsProductProps): Promise<AdjustmentsProductResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      movement_type: [
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT,
        AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
      ],
      all: true,
    },
  };
  const { data } = await api.get<AdjustmentsProductResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAdjustmentsProductById(
  id: number
): Promise<AdjustmentsProductResource> {
  const { data } = await api.get<AdjustmentsProductResource>(
    `${ENDPOINT}/${id}`
  );
  return data;
}

export async function findAdjustmentsProductById(
  id: number
): Promise<AdjustmentsProductResource> {
  const response = await api.get<AdjustmentsProductResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAdjustmentsProduct(
  payload: AdjustmentsProductRequest
): Promise<AdjustmentsProductResource> {
  const { data } = await api.post<AdjustmentsProductResource>(
    `${ENDPOINT}/adjustments`,
    payload
  );
  return data;
}

export async function updateAdjustmentsProduct(
  id: number,
  payload: Partial<AdjustmentsProductRequest>
): Promise<AdjustmentsProductResource> {
  const { data } = await api.put<AdjustmentsProductResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteAdjustmentsProduct(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
