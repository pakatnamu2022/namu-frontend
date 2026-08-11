import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";

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
  has_retention?: boolean;
}

export interface DiscountCouponResource {
  id: number;
  description: string;
  type: "FIJO" | "PORCENTAJE";
  percentage: string;
  amount: string;
  valor_unitario: string;
  precio_unitario: string;
  is_negative: boolean;
  has_retention: boolean;
  concept_code_id: number;
  concept_code: string;
}

export interface DiscountCouponUpdatePayload {
  has_retention?: boolean;
  description?: string;
  value?: number;
  is_negative?: boolean;
}

export interface OtherCostResource {
  id: number;
  description: string;
  type: "FIJO" | "PORCENTAJE";
  value: string;
  amount: string;
}

export interface AccessoryResource {
  id: number;
  type: "ACCESORIO_ADICIONAL" | "OBSEQUIO";
  approved_accessory_id: number;
  description: string;
  quantity: number;
  price: string;
  additional_price: number;
  total: string;
  type_currency_id: number;
  type_currency_code: string;
  type_currency_symbol: string;
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
  warranty_years: number;
  warranty_km: number;
  consultant: WorkerResource;
  bonus_discounts: BonusDiscountResource[];
  accessories: AccessoryResource[];
  others: OtherCostResource[];
  credit_type?: string | null;
  credit_entity?: string | null;
  insurance_entity?: string | null;
  gps_hunter_years?: number | null;
  margin_amount: number;
  margin_pct: number;
  sede_id: number;
  sede: string;
  down_payment?: number;
  kyc_declaration_id?: number | null;
  kyc_status?: string | null;
  created_at: string;
  updated_at: string;
  ap_vehicle?: VehicleResource;
  model?: ModelsVnResource;
  electronic_documents?: ElectronicDocumentResource[];
}

export interface OtherCostPayload {
  description: string;
  type: "FIJO" | "PORCENTAJE";
  value: number;
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
  down_payment?: number;
  others?: OtherCostPayload[];
  credit_type?: string | null;
  credit_entity?: string | null;
  insurance_entity?: string | null;
  gps_hunter_years?: number | null;
}

export interface ConceptDiscountBondResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
  parent_id?: number | null;
}

// Maestros de crédito / seguros (tipos de crédito, entidades de crédito y
// entidades de seguro), obtenidos desde /ap/apMasters
export interface CreditInsuranceMasterResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status?: boolean;
  parent_id?: number | null;
}

export interface getPurchaseRequestQuoteProps {
  params?: Record<string, any>;
}
