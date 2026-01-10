import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { ProductResource } from "../../../gestion-productos/productos/lib/product.interface";

export interface OrderQuotationDetailsResponse {
  data: OrderQuotationDetailsResource[];
  links: Links;
  meta: Meta;
}

export interface OrderQuotationDetailsResource {
  id: number;
  order_quotation_id: number;
  item_type: string;
  product_id: number | null;
  description: string;
  quantity: number;
  unit_measure: string;
  retail_price_external: number;
  freight_commission: number;
  exchange_rate: number;
  unit_price: number;
  discount: number;
  total_amount: number;
  observations: string | null;
  product: ProductResource | null;
}

export interface OrderQuotationDetailsRequest {
  order_quotation_id: number;
  item_type: string;
  product_id?: number;
  description: string;
  quantity: number;
  unit_measure: string;
  retail_price_external?: number;
  freight_commission?: number;
  exchange_rate?: number;
  unit_price: number;
  discount: number;
  total_amount: number;
  observations?: string;
}

export interface getOrderQuotationDetailsProps {
  params?: Record<string, any>;
}
