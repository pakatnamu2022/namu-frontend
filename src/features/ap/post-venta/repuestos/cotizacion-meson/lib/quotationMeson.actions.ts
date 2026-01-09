import { api } from "@/core/api";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { QuotationMesonWithProductsSchema } from "./quotationMeson.schema";
import { GeneralResponse } from "@/shared/lib/response.interface";

const ENDPOINT = "/ap/postVenta/orderQuotations";

export async function storeOrderQuotationWithProducts(
  data: QuotationMesonWithProductsSchema
): Promise<OrderQuotationResource> {
  const response = await api.post<OrderQuotationResource>(
    `${ENDPOINT}/with-products`,
    data
  );
  return response.data;
}

export async function updateOrderQuotationWithProducts(
  id: number,
  data: QuotationMesonWithProductsSchema
): Promise<OrderQuotationResource> {
  const response = await api.put<OrderQuotationResource>(
    `${ENDPOINT}/${id}/with-products`,
    data
  );
  return response.data;
}

export interface DiscardQuotationData {
  discard_reason_id: number;
  discarded_note?: string | null;
}

export async function discardOrderQuotation(
  id: number,
  data: DiscardQuotationData
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(
    `${ENDPOINT}/${id}/discard`,
    data
  );
  return response.data;
}
