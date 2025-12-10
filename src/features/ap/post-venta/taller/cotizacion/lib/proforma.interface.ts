import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface OrderQuotationResponse {
  data: OrderQuotationResource[];
  links: Links;
  meta: Meta;
}

export interface OrderQuotationResource {
  id: number;
  vehicle_id: number;
  vehicle: VehicleResource;
  quotation_number: string;
  subtotal: number;
  discount_percentage: number | null;
  discount_amount: number | null;
  tax_amount: number | null;
  total_amount: number;
  validity_days: number | null;
  quotation_date: string;
  expiration_date: string | null;
  observations: string | null;
  details: OrderQuotationDetail[];
  created_at: string;
  updated_at: string;
}

export interface OrderQuotationDetail {
  id: number;
  order_quotation_id: number;
  item_type: string; // PRODUCT | LABOR
  product_id: number;
  product_name: string;
  description: string;
  quantity: number;
  unit_measure: string;
  unit_price: number;
  discount: number;
  total_amount: number;
  observations?: string;
}

export interface OrderQuotationRequest {
  vehicle_id: string;
  quotation_date: string | Date;
  expiration_date: string | Date;
  observations?: string;
}

export interface getOrderQuotationProps {
  params?: Record<string, any>;
}
