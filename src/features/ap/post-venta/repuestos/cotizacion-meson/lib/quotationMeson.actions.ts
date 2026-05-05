import { api } from "@/core/api";
import {
  ConfirmByTokenData,
  ConfirmByTokenResponse,
  OrderQuotationResource,
  PublicQuotationByTokenResponse,
  SendVirtualConfirmationResponse,
} from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
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

// ─── Confirmación Virtual ────────────────────────────────────────────────────

export async function sendVirtualConfirmation(
  id: number,
): Promise<SendVirtualConfirmationResponse> {
  const response = await api.post<SendVirtualConfirmationResponse>(
    `${ENDPOINT}/${id}/send-virtual-confirmation`,
  );
  return response.data;
}

export async function regenerateConfirmationToken(
  id: number,
): Promise<SendVirtualConfirmationResponse> {
  const response = await api.post<SendVirtualConfirmationResponse>(
    `${ENDPOINT}/${id}/regenerate-token`,
  );
  return response.data;
}

// ─── Endpoints Públicos (sin autenticación) ──────────────────────────────────

import axios from "axios";
import { MILLA_GP_BASEPATH } from "@/core/api";

const publicApi = axios.create({
  baseURL: MILLA_GP_BASEPATH + "/api",
});

export async function getPublicQuotationByToken(
  token: string,
): Promise<PublicQuotationByTokenResponse> {
  const response = await publicApi.get(
    `/public/quotation-confirmation/${token}`,
  );
  return response.data;
}

export async function confirmQuotationByToken(
  token: string,
  data?: ConfirmByTokenData,
): Promise<ConfirmByTokenResponse> {
  const response = await publicApi.post(
    `/public/quotation-confirmation/${token}`,
    data || {},
  );
  return response.data;
}

export async function updateOrderQuotationInvoiceTo(
  id: number,
  invoiceToId: number | null,
): Promise<OrderQuotationResource> {
  const response = await api.patch<OrderQuotationResource>(
    `${ENDPOINT}/${id}/invoice-to`,
    { invoice_to: invoiceToId },
  );
  return response.data;
}
