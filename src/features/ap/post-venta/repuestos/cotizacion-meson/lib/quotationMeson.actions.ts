import { api } from "@/core/api";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { QuotationMesonWithProductsSchema } from "./quotationMeson.schema";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { format } from "date-fns";

const ENDPOINT = "/ap/postVenta/orderQuotations";

function formatDateField(val: unknown): string | unknown {
  if (val instanceof Date) return format(val, "yyyy-MM-dd");
  return val;
}

function prepareDates(data: QuotationMesonWithProductsSchema) {
  return {
    ...data,
    quotation_date: formatDateField(data.quotation_date),
    expiration_date: formatDateField(data.expiration_date),
    collection_date: formatDateField(data.collection_date),
  };
}

export async function storeOrderQuotationWithProducts(
  data: QuotationMesonWithProductsSchema,
): Promise<OrderQuotationResource> {
  const response = await api.post<OrderQuotationResource>(
    `${ENDPOINT}/with-products`,
    prepareDates(data),
  );
  return response.data;
}

export async function updateOrderQuotationWithProducts(
  id: number,
  data: QuotationMesonWithProductsSchema,
): Promise<OrderQuotationResource> {
  const response = await api.put<OrderQuotationResource>(
    `${ENDPOINT}/${id}/with-products`,
    prepareDates(data),
  );
  return response.data;
}

export interface DiscardQuotationData {
  discard_reason_id: number;
  discarded_note?: string | null;
}

export async function discardOrderQuotation(
  id: number,
  data: DiscardQuotationData,
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(
    `${ENDPOINT}/${id}/discard`,
    data,
  );
  return response.data;
}

export interface ConfirmQuotationData {
  customer_signature: string;
}

export async function confirmOrderQuotation(
  id: number,
  data: ConfirmQuotationData,
): Promise<OrderQuotationResource> {
  const response = await api.put<OrderQuotationResource>(
    `${ENDPOINT}/${id}/confirm`,
    data,
  );
  return response.data;
}

export interface DeliveryOutputData {
  customer_signature_delivery_url: string;
  delivery_document_number: string;
}

export async function deliverInventoryOutput(
  id: number,
  data: DeliveryOutputData,
): Promise<OrderQuotationResource> {
  const response = await api.put<OrderQuotationResource>(
    `${ENDPOINT}/${id}/delivery-info`,
    data,
  );
  return response.data;
}
