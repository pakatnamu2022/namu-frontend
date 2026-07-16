import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { VehicleInspectionResource } from "../../inspeccion-vehiculo/lib/vehicleInspection.interface";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";
import { OrderQuotationResource } from "../../cotizacion/lib/proforma.interface";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { WorkOrderLabourResource } from "../../orden-trabajo-labor/lib/workOrderLabour.interface";
import { WorkOrderPartsResource } from "../../orden-trabajo-repuesto/lib/workOrderParts.interface";
import { ApMastersResource } from "@/features/ap/ap-master/lib/apMasters.interface";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";

export interface WorkOrderResponse {
  data: WorkOrderResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderResource {
  id: number;
  correlative: string;
  mileage: string;
  fuel_level: string;
  order_quotation_id: number | null;
  appointment_planning_id: string;
  vehicle_inspection_id: string;
  vehicle_id: string;
  currency_id: string;
  vehicle: VehicleResource;
  vehicle_plate: string;
  vehicle_vin: string;
  status_id: string;
  advisor_id: string;
  advisor_name: string;
  sede_id: string;
  sede_name: string;
  opening_date: string;
  estimated_delivery_date: string;
  estimated_delivery_time: string;
  actual_delivery_date: string;
  diagnosis_date: string;
  observations: string;
  is_invoiced: boolean;
  is_guarantee: boolean;
  is_recall: boolean;
  description_recall: string | null;
  type_recall: "ROJO" | "AMARILLO" | "VERDE" | null;
  is_inspection_completed: boolean;
  cost_man_hours: number;
  is_invalid_with_quote: boolean;
  //Costos
  total_labor_cost: number;
  total_parts_cost: number;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  deductible_amount: number;
  deductible_id: number | null;
  is_delivery: boolean;
  num_doc_contact: string;
  full_contact_name: string;
  phone_contact: string;
  num_doc_pickup: string | null;
  full_pickup_name: string | null;
  phone_pickup: string | null;

  type_currency: CurrencyTypesResource;
  vehicle_inspection: VehicleInspectionResource | null;
  items: WorkOrderItemResource[];
  order_quotation?: OrderQuotationResource;
  labours: WorkOrderLabourResource[];
  parts: WorkOrderPartsResource[];
  vouchers: WorkOrderDocumentsTreeResource;
  items_invoice?: WorkOrderInvoiceItemResource[];
  invoice_preview?: WorkOrderInvoicePreviewResource;
  payment_summary: {
    paid_amount: number;
    pending_amount: number;
    remaining_balance: number;
    payment_percentage: number;
    has_final_invoice: boolean;
    advances_count: number;
  };
  status: ApMastersResource;
  invoice_to: number | null;
  invoice_to_client: CustomersResource | null;
  internal_note?: InternalNoteResource;
  discard_reason: string | null;
  discarded_note: string | null;
  discarded_by_name: string | null;
  discarded_at: string | null;
  created_by_name: string;
  exchange_rate: number;
}

export interface WorkOrderInvoiceItemResource {
  type: "labour" | "part" | "anticipo_regularizacion";
  source_id: number;
  account_plan_id: number;
  unidad_de_medida: string;
  codigo: string | null;
  product_id: number | null;
  descripcion: string;
  cantidad: number;
  sunat_concept_igv_type_id: number;
  anticipo_regularizacion: boolean;
  anticipo_documento_serie: string | null;
  anticipo_documento_numero: number | null;
  reference_document_id: number | string | null;
  valor_unitario: number;
  precio_unitario: number;
  descuento: number | null;
  subtotal: number;
  igv: number;
  total: number;
}

export interface WorkOrderInvoicePreviewResource {
  total_gravada: number;
  total_inafecta: number;
  total_exonerada: number;
  total_igv: number;
  total_gratuita: number;
  total_anticipo: number;
  total: number;
}

export interface InternalNoteResource {
  id: number;
  number: string;
  work_order_id: number;
  created_date: string;
  closed_date: string | null;
  status: "pending" | "invoiced";
  created_at: string;
  updated_at: string;
}

export interface WorkOrderRequest {
  appointment_planning_id?: string;
  vehicle_id: string;
  sede_id: string;
  estimated_delivery_time: string | Date;
  observations: string;
}

export interface StoreWorkOrderDeductibleRequest {
  work_order_id: number;
  electronic_document_id: number;
}

export const GROUP_COLORS: Record<number, { badge: string; input: string }> = {
  1: {
    badge: "#1A388B", // blue-500
    input: "border-blue-400 bg-blue-50 text-primary font-semibold",
  },
  2: {
    badge: "#22c55e", // green-500
    input: "border-green-400 bg-green-50 text-green-900 font-semibold",
  },
  3: {
    badge: "#a855f7", // purple-500
    input: "border-purple-400 bg-purple-50 text-purple-900 font-semibold",
  },
  4: {
    badge: "#f97316", // orange-500
    input: "border-orange-400 bg-orange-50 text-orange-900 font-semibold",
  },
  5: {
    badge: "#ec4899", // pink-500
    input: "border-pink-400 bg-pink-50 text-pink-900 font-semibold",
  },
  6: {
    badge: "#06b6d4", // cyan-500
    input: "border-cyan-400 bg-cyan-50 text-cyan-900 font-semibold",
  },
  7: {
    badge: "#6366f1", // indigo-500
    input: "border-indigo-400 bg-indigo-50 text-indigo-900 font-semibold",
  },
  8: {
    badge: "#f43f5e", // rose-500
    input: "border-rose-400 bg-rose-50 text-rose-900 font-semibold",
  },
  9: {
    badge: "#14b8a6", // teal-500
    input: "border-teal-400 bg-teal-50 text-teal-900 font-semibold",
  },
  10: {
    badge: "#f59e0b", // amber-500
    input: "border-amber-400 bg-amber-50 text-amber-900 font-semibold",
  },
};

export const DEFAULT_GROUP_COLOR = {
  badge: "#6b7280", // gray-500
  input: "border-gray-400 bg-gray-50 text-gray-900 font-semibold",
};

export interface getWorkOrderProps {
  params?: Record<string, any>;
  enabled?: boolean;
}

export interface VehicleWorkOrderHistoryWork {
  description: string;
  actual_hours: number | null;
  worker: string | null;
  actual_start_datetime: string | null;
  actual_end_datetime: string | null;
  status: string;
}

export interface VehicleWorkOrderHistoryPart {
  description: string;
  quantity: string;
}

export interface VehicleWorkOrderHistoryItem {
  correlative: string;
  opening_date: string;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  diagnosis_date: string | null;
  status: string;
  sede: string;
  advisor: string;
  is_guarantee: boolean;
  is_recall: boolean;
  description_recall: string | null;
  type_recall: string | null;
  observations: string | null;
  works_performed: VehicleWorkOrderHistoryWork[];
  parts_used: VehicleWorkOrderHistoryPart[];
}

export interface VehicleWorkOrderHistoryResponse {
  vehicle_id: number;
  vehicle_plate: string;
  vehicle_vin: string;
  data: VehicleWorkOrderHistoryItem[];
}

export interface GenerateWorkOrderResponse {
  message: string;
}

export interface WorkOrderBasicInfoResource {
  id: number;
  correlative: string;
  total_labor_cost: number;
  total_parts_cost: number;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  vehicle_plate: string;
  opening_date: string;
  observations: string;

  //Relations
  invoice_to_client: CustomersResource | null;
  vouchers: WorkOrderDocumentsTreeResource;
}

// Tipos de modificación
type ModificationType = "credit_note" | "debit_note";

// Modificación (Nota de Crédito o Débito)
interface Modification {
  id: number;
  type: ModificationType;
  concept_type: string;
  concept_type_id: number;
  number: string;
  serie: string;
  numero: string;
  total: number; // Negativo para credit notes, positivo para debit notes
  issue_date: string;
  original_document_id: number;
  observaciones: string | null;
  enlace_del_pdf: string | null;
}

// Documento base (campos comunes)
export interface BaseDocument {
  id: number;
  is_advance_payment: boolean;
  document_type: string;
  number: string;
  serie: string;
  numero: string;
  total: number;
  issue_date: string;
  client_name: string;
  client_document: string;
  status: string;
  sunat_responsecode: string | null;
  enlace_del_pdf: string | null;
}

// Documento cancelado
export interface CancelledDocument extends BaseDocument {
  cancellation_reason: string | null;
  credit_note_number: string | null;
  sunat_concept_credit_note_type_id: number | null;
  credit_note_type_description: string | null;
}

// Documento activo
export interface ActiveDocument extends BaseDocument {
  net_amount: number;
  has_modifications: boolean;
  modifications: Modification[];
}

export interface WorkOrderDocumentsTreeResource {
  cancelled: CancelledDocument[];
  active: ActiveDocument[];
}
