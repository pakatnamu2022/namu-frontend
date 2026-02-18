import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  DiscountRequestOrderQuotationRequest,
  DiscountRequestOrderQuotationResource,
} from "./discountRequestMeson.interface";

const ENDPOINT = "/ap/postVenta/discountRequestsOrderQuotation";

export async function getDiscountRequestsByQuotation(
  quotationId: number,
): Promise<DiscountRequestOrderQuotationResource[]> {
  const response = await api.get<{ data: DiscountRequestOrderQuotationResource[] }>(
    ENDPOINT,
    { params: { ap_order_quotation_id: quotationId } },
  );
  return response.data.data;
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
