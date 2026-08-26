import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PURCHASE_REQUEST_QUOTE_ADJUSTMENT } from "./purchaseRequestQuoteAdjustment.constants";
import {
  AdjustmentRequestResource,
  AdjustmentRequestResponse,
  CreateAdjustmentRequestPayload,
  getAdjustmentRequestProps,
} from "./purchaseRequestQuoteAdjustment.interface";

const { ENDPOINT } = PURCHASE_REQUEST_QUOTE_ADJUSTMENT;

export async function getAdjustmentRequests({
  params,
}: getAdjustmentRequestProps): Promise<AdjustmentRequestResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<AdjustmentRequestResponse>(ENDPOINT, config);
  return data;
}

export async function findAdjustmentRequestById(
  id: number,
): Promise<AdjustmentRequestResource> {
  const { data } = await api.get<AdjustmentRequestResource>(
    `${ENDPOINT}/${id}`,
  );
  return data;
}

export async function storeAdjustmentRequest(
  payload: CreateAdjustmentRequestPayload,
): Promise<AdjustmentRequestResource> {
  const { data } = await api.post<AdjustmentRequestResource>(
    ENDPOINT,
    payload,
  );
  return data;
}

export async function approveAdjustmentRequest(
  id: number,
): Promise<AdjustmentRequestResource> {
  const { data } = await api.put<AdjustmentRequestResource>(
    `${ENDPOINT}/${id}/approve`,
  );
  return data;
}

export async function rejectAdjustmentRequest(
  id: number,
  reason?: string,
): Promise<AdjustmentRequestResource> {
  const { data } = await api.put<AdjustmentRequestResource>(
    `${ENDPOINT}/${id}/reject`,
    { reason },
  );
  return data;
}

export async function cancelAdjustmentRequest(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
