import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

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
  quantity: string | number;
  unit_measure: string;
  retail_price_external?: string | number;
  flete_external?: string | number;
  percentage_flete_external?: string | number;
  unit_price: string | number;
  discount: string | number;
  total_amount: string | number;
  observations: string | null;
}

export interface OrderQuotationDetailsRequest {
  order_quotation_id: number;
  item_type: string;
  product_id?: number;
  description: string;
  quantity: number;
  unit_measure: string;
  retail_price_external?: number;
  flete_external?: number;
  percentage_flete_external?: number;
  unit_price: number;
  discount: number;
  total_amount: number;
  observations?: string;
}

export interface getOrderQuotationDetailsProps {
  params?: Record<string, any>;
}
