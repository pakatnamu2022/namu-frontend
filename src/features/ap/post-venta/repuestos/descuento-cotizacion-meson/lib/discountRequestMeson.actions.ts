import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  DiscountRequestOrderQuotationRequest,
  DiscountRequestOrderQuotationResource,
  getDiscountRequestOrderProps,
} from "./discountRequestMeson.interface";
import { AxiosRequestConfig } from "axios";

const ENDPOINT = "/ap/postVenta/discountRequestsOrderQuotation";

export async function getAllDiscountRequestsQuotation({
  params,
}: getDiscountRequestOrderProps): Promise<
  DiscountRequestOrderQuotationResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<DiscountRequestOrderQuotationResource[]>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function storeDiscountRequestOrderQuotation(
  data: DiscountRequestOrderQuotationRequest,
): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateDiscountRequestOrderQuotation(
  id: number,
  data: DiscountRequestOrderQuotationRequest,
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteDiscountRequestOrderQuotation(
  id: number,
): Promise<GeneralResponse> {
  const response = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function approveDiscountRequestOrderQuotation(
  id: number,
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(`${ENDPOINT}/${id}/approve`);
  return response.data;
}

export async function rejectDiscountRequestOrderQuotation(
  id: number,
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(`${ENDPOINT}/${id}/reject`);
  return response.data;
}
