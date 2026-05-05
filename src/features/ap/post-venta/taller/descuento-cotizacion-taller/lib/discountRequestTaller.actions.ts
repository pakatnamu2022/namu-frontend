import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  DiscountRequestWorkOrderQuotationRequest,
  DiscountRequestWorkOrderQuotationResource,
} from "./discountRequestTaller.interface";

const ENDPOINT = "/ap/postVenta/discountRequestsWorkOrder";

export async function getDiscountRequestsByWorkOrderQuotation(
  quotationId: number,
): Promise<DiscountRequestWorkOrderQuotationResource[]> {
  const response = await api.get<{
    data: DiscountRequestWorkOrderQuotationResource[];
  }>(ENDPOINT, { params: { ap_order_quotation_id: quotationId } });
  return response.data.data;
}

export async function getDiscountRequestsByWorkOrder(
  workOrderId: number,
): Promise<DiscountRequestWorkOrderQuotationResource[]> {
  const response = await api.get<{
    data: DiscountRequestWorkOrderQuotationResource[];
  }>(ENDPOINT, { params: { ap_work_order_id: workOrderId } });
  return response.data.data;
}

export async function storeDiscountRequestWorkOrderQuotation(
  data: DiscountRequestWorkOrderQuotationRequest,
): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateDiscountRequestWorkOrderQuotation(
  id: number,
  data: DiscountRequestWorkOrderQuotationRequest,
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteDiscountRequestWorkOrderQuotation(
  id: number,
): Promise<GeneralResponse> {
  const response = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function approveDiscountRequestWorkOrderQuotation(
  id: number,
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(`${ENDPOINT}/${id}/approve`);
  return response.data;
}

export async function rejectDiscountRequestWorkOrderQuotation(
  id: number,
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(`${ENDPOINT}/${id}/reject`);
  return response.data;
}
