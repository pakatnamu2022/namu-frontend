import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { OrderQuotationDetailsResource } from "../../cotizacion-detalle/lib/proformaDetails.interface";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";

export interface OrderQuotationResponse {
  data: OrderQuotationResource[];
  links: Links;
  meta: Meta;
}

export interface OrderQuotationResource {
  id: number;
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
  collection_date: string;
  observations: string | null;
  notes: string | null;
  details: OrderQuotationDetailsResource[];
  advances: ElectronicDocumentResource[];
  client: CustomersResource;
  currency_id: number;
  type_currency: CurrencyTypesResource;
  created_at: string;
  updated_at: string;
  area_id: number | null;
  sede_id: number;
  warehouse_id: number;
  has_invoice_generated: boolean;
  is_fully_paid: boolean;
  output_generation_warehouse: boolean;
  status: string;
  supply_type: "STOCK" | "CENTRAL" | "IMPORTACION";
  exchange_rate: number;
  chief_approval_by: string | null;
  manager_approval_by: string | null;
  customer_signature_delivery_url: string | null;
  delivery_document_number: string | null;
  has_management_discount: boolean;
  //Confirmacion virtual
  confirmed_at: string | null;
  confirmation_channel: string | null;
  confirmation_ip: string | null;
  confirmation_metadata: Record<string, any> | null;
  //Facturación
  invoice_to: number | null;
  invoice_to_client: CustomersResource | null;
  //Opcionales
  has_sufficient_stock: boolean;
  cost_man_hours: number;
  is_requested_by_management: boolean;
}

export interface ApprovalRequest {
  chief_approval_by?: string;
  manager_approval_by?: string;
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

// ─── Confirmación Virtual ────────────────────────────────────────────────────

export interface SendVirtualConfirmationResponse {
  success: boolean;
  message: string;
  confirmation_link: string;
  sent_to: string;
  expires_at: string;
  quotation: OrderQuotationResource;
}

export interface PublicQuotationByTokenResponse {
  success: boolean;
  message: string;
  data: {
    already_confirmed: boolean;
    confirmed_at: string;
    confirmation_channel: string;
    quotation: OrderQuotationResource | null;
  };
}

export interface ConfirmByTokenData {
  notes?: string;
  confirmed_by_name?: string;
}

export interface ConfirmByTokenResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    quotation_number: string;
    confirmed_at: string;
    confirmation_channel: string;
    status: string;
  };
}
