import { api } from "@/core/api";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import { QuotationMesonWithProductsSchema } from "./quotationMeson.schema";

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
