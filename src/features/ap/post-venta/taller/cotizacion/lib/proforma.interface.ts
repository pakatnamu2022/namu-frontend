import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { OrderQuotationDetailsResource } from "../../cotizacion-detalle/lib/proformaDetails.interface";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";

export interface OrderQuotationResponse {
  data: OrderQuotationResource[];
  links: Links;
  meta: Meta;
}

export interface OrderQuotationResource {
  id: number;
  customer: string;
  created_by_name: string;
  vehicle_id: number;
  vehicle: VehicleResource;
  quotation_number: string;
  subtotal: number;
  discount_percentage: number | null;
  discount_amount: number;
  op_gravada: number;
  tax_amount: number | null;
  total_amount: number;
  validity_days: number | null;
  quotation_date: string;
  expiration_date: string;
  observations: string | null;
  details: OrderQuotationDetailsResource[];
  advances: ElectronicDocumentResource[];
  currency_id: number;
  type_currency: CurrencyTypesResource;
  created_at: string;
  updated_at: string;
  area_id: number | null;
  sede_id: number | null;
  has_invoice_generated: boolean;
  is_fully_paid: boolean;
  output_generation_warehouse: boolean;
  status: string;
  customer_signature: string | null;
  has_sufficient_stock: boolean;
  supply_type: "STOCK" | "LIMA" | "IMPORTACION";
  exchange_rate: number;
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
