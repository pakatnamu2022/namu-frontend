import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";

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
  is_negative?: boolean;
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
  is_paid: boolean;
  correlative: string;
  type_document: string;
  type_vehicle?: string;
  quote_deadline?: string;
  exchange_rate_id: number;
  exchange_rate: number;
  base_selling_price: string;
  sale_price: string;
  doc_sale_price: number;
  type_currency_id: number;
  type_currency: string;
  type_currency_symbol: string;
  comment?: string;
  is_invoiced: number;
  is_approved: number;
  opportunity_id: number;
  holder_id: number;
  holder: string;
  holder_document_number: string;
  holder_document_type: number;
  holder_address: string;
  holder_email: string;
  holder_phone: string;
  client_name: string;
  ap_vehicle_id?: number;
  vehicle_color_id: number;
  vehicle_color: string;
  ap_models_vn_id: number;
  ap_model_vn: string;
  brand_id: number;
  ap_vehicle_purchase_order_id: null;
  ap_vehicle_purchase_order: null;
  doc_type_currency_id: number;
  doc_type_currency: string;
  doc_type_currency_symbol: string;
  advisor_name: string;
  warranty: string;
  consultant: WorkerResource;
  bonus_discounts: BonusDiscountResource[];
  accessories: AccessoryResource[];
  sede_id: number;
  sede: string;
  created_at: string;
  updated_at: string;
  ap_vehicle?: VehicleResource;
  model?: ModelsVnResource;
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
