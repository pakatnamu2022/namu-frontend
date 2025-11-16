import { Links, Meta } from "@/shared/lib/pagination.interface";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";

export interface PurchaseRequestQuoteResponse {
  data: PurchaseRequestQuoteResource[];
  links: Links;
  meta: Meta;
}

export interface BonusDiscountResource {
  id: number;
  description: string;
  type: "FIJO" | "PORCENTAJE";
  percentage: string;
  amount: string;
  concept_code_id: number;
  concept_code: string;
}

export interface AccessoryResource {
  id: number;
  type: "ACCESORIO_ADICIONAL" | "OBSEQUIO";
  approved_accessory_id: number;
  quantity: number;
  price: string;
  total: string;
}

export interface PurchaseRequestQuoteResource {
  id: number;
  correlative: string;
  type_document: string;
  quote_deadline: string | null;
  exchange_rate_id: number;
  exchange_rate: string;
  base_selling_price: string;
  sale_price: string;
  comment: string;
  warranty: string;
  is_invoiced: number;
  is_approved: number;
  opportunity_id: string | null;
  holder_id: string;
  holder: string;
  holder_document_number: string;
  holder_document_type: number;
  holder_address: string;
  holder_email: string;
  holder_phone: string;
  vehicle_color_id: string | null;
  vehicle_color: string | null;
  ap_models_vn_id: string | null;
  ap_model_vn: string | null;
  doc_type_currency_id: number;
  doc_type_currency: string;
  doc_type_currency_symbol: string;
  bonus_discounts: BonusDiscountResource[];
  accessories: AccessoryResource[];
  sede_id: string;
  ap_vehicle_id?: number;
  ap_vehicle?: VehicleResource;
}

export interface PurchaseRequestQuoteRequest {
  type_document: string;
  quote_deadline: string;
  type_currency_id: number;
  base_selling_price: number;
  sale_price: number;
  doc_sale_price: number;
  comment: string;
  exchange_rate_id: string;
  opportunity_id: string;
  holder_id: string;
  vehicle_color_id?: string;
  ap_models_vn_id?: string;
  ap_vehicle_id?: string;
  doc_type_currency_id: string;
}

export interface ConceptDiscountBondResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface getPurchaseRequestQuoteProps {
  params?: Record<string, any>;
}
