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
  unit_price: number;
  discount: number;
  total_amount: number;
  observations?: string;
}

export interface getOrderQuotationDetailsProps {
  params?: Record<string, any>;
}
