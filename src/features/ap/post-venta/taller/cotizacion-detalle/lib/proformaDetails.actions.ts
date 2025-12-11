import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getOrderQuotationDetailsProps,
  OrderQuotationDetailsRequest,
  OrderQuotationDetailsResource,
  OrderQuotationDetailsResponse,
} from "./proformaDetails.interface";
import { ORDER_QUOTATION_DETAILS } from "./proformaDetails.constants";

const { ENDPOINT } = ORDER_QUOTATION_DETAILS;

export async function getOrderQuotationDetails({
  params,
}: getOrderQuotationDetailsProps): Promise<OrderQuotationDetailsResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<OrderQuotationDetailsResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllOrderQuotationDetails({
  params,
}: getOrderQuotationDetailsProps): Promise<OrderQuotationDetailsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<OrderQuotationDetailsResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findOrderQuotationDetailsById(
  id: number
): Promise<OrderQuotationDetailsResource> {
  const response = await api.get<OrderQuotationDetailsResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeOrderQuotationDetails(
  data: OrderQuotationDetailsRequest
): Promise<OrderQuotationDetailsResource> {
  const response = await api.post<OrderQuotationDetailsResource>(ENDPOINT, data);
  return response.data;
}

export async function updateOrderQuotationDetails(
  id: number,
  data: OrderQuotationDetailsRequest
): Promise<OrderQuotationDetailsResource> {
  const response = await api.put<OrderQuotationDetailsResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteOrderQuotationDetails(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
