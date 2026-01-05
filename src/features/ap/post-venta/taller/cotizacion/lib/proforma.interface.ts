import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { OrderQuotationDetailsResource } from "../../cotizacion-detalle/lib/proformaDetails.interface";

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
  expiration_date: string;
  observations: string | null;
  details: OrderQuotationDetailsResource[];
  created_at: string;
  updated_at: string;
  area_id: number | null;
  sede_id: number | null;
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
