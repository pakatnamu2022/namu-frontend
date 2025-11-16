import { SunatConceptsResource } from "@/src/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { Links, Meta } from "@/src/shared/lib/pagination.interface";
import {
  VehicleMovement,
  VehicleResource,
} from "../../../comercial/vehiculos/lib/vehicles.interface";

export interface ElectronicDocumentResponse {
  data: ElectronicDocumentResource[];
  links: Links;
  meta: Meta;
}

export interface ElectronicDocumentResource {
  id: number;
  sunat_concept_document_type_id: number;
  series_id: number;
  serie: string;
  numero: number;
  full_number: string;
  sunat_concept_transaction_type_id: number;
  origin_module: "comercial" | "posventa";
  origin_entity_type?: string;
  origin_entity_id: number;
  ap_vehicle_movement_id?: number;
  purchase_request_quote_id?: number;
  credit_note_id?: number;
  debit_note_id?: number;
  client_id: number;
  sunat_concept_identity_document_type_id: number;
  cliente_numero_de_documento: string;
  cliente_denominacion: string;
  cliente_direccion: string;
  cliente_email: string;
  cliente_email_1: string;
  cliente_email_2: string;
  fecha_de_emision: string;
  fecha_de_vencimiento?: string;
  sunat_concept_currency_id: number;
  tipo_de_cambio?: number;
  exchange_rate_id?: number;
  porcentaje_de_igv: number;
  descuento_global?: number;
  total_descuento?: number;
  total_anticipo?: number;
  total_gravada?: number;
  total_inafecta?: number;
  total_exonerada?: number;
  total_igv?: number;
  total_gratuita?: number;
  total_otros_cargos?: number;
  total_isc?: number;
  total: number;
  percepcion_tipo?: number;
  percepcion_base_imponible?: number;
  total_percepcion?: number;
  total_incluido_percepcion?: number;
  retencion_tipo?: number;
  retencion_base_imponible?: number;
  total_retencion?: number;
  detraccion: boolean;
  sunat_concept_detraction_type_id?: number;
  detraccion_total?: number;
  detraccion_porcentaje?: number;
  medio_de_pago_detraccion?: number;
  documento_que_se_modifica_tipo?: number;
  documento_que_se_modifica_serie?: string;
  documento_que_se_modifica_numero?: number;
  original_document_id?: number;
  sunat_concept_credit_note_type_id?: number;
  sunat_concept_debit_note_type_id?: number;
  observaciones?: string;
  condiciones_de_pago?: string;
  medio_de_pago?: string;
  placa_vehiculo?: string;
  orden_compra_servicio?: string;
  codigo_unico?: string;
  enviar_automaticamente_a_la_sunat?: boolean;
  enviar_automaticamente_al_cliente?: boolean;
  generado_por_contingencia?: boolean;
  status: "draft" | "sent" | "accepted" | "rejected" | "cancelled";
  aceptada_por_sunat?: boolean;
  sunat_responsecode?: string;
  sunat_note?: string;
  sunat_soap_error?: string;
  sunat_description?: string;
  anulado: boolean;
  enlace_del_pdf?: string;
  enlace_del_xml?: string;
  enlace_del_cdr?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  accepted_at?: string;
  cancelled_at?: string;
  migrated_at?: string;
  migration_status?: string;
  created_by?: number;
  updated_by?: number;
  document_type?: SunatConceptsResource;
  transaction_type?: SunatConceptsResource;
  identity_document_type?: SunatConceptsResource;
  currency?: SunatConceptsResource;
  items?: ElectronicDocumentItem[];
  guides?: ElectronicDocumentGuide[];
  installments?: ElectronicDocumentInstallment[];
  vehicle_movement?: VehicleMovement;
}

export interface ElectronicDocumentItem {
  id?: number;
  ap_billing_electronic_document_id?: number;
  reference_document_id?: number;
  account_plan_id?: number;
  unidad_de_medida: string;
  codigo?: string;
  codigo_producto_sunat?: string;
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
  precio_unitario: number;
  descuento?: number;
  subtotal: number;
  sunat_concept_igv_type_id: number;
  igv: number;
  total: number;
  anticipo_regularizacion?: boolean;
  anticipo_documento_serie?: string;
  anticipo_documento_numero?: number;
  igvType?: SunatConceptsResource;
}

export interface ElectronicDocumentGuide {
  id?: number;
  ap_billing_electronic_document_id?: number;
  guia_tipo: number;
  guia_serie_numero: string;
}

export interface ElectronicDocumentInstallment {
  id?: number;
  ap_billing_electronic_document_id?: number;
  cuota: number;
  fecha_de_pago: string;
  importe: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AdvancePaymentsByQuotationResponse {
  vehicle?: VehicleResource;
  documents: ElectronicDocumentResource[];
  total_documents: number;
  total_amount: number;
}

export interface ElectronicDocumentMigrationLogsResponse {
  electronic_document: ElectronicDocumentFromLog;
  logs: ElectronicDocumentMigrationLogsResource[];
}

export interface ElectronicDocumentMigrationLogsResource {
  id: number;
  step: string;
  step_name: string;
  status: string;
  status_name: string;
  table_name: string;
  external_id: string;
  proceso_estado: number;
  proceso_estado_name: string;
  error_message: null;
  attempts: number;
  last_attempt_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ElectronicDocumentFromLog {
  id: number;
  full_number: string;
  serie: string;
  numero: number;
  migration_status: string;
  migrated_at: string;
  created_at: string;
}

export interface ElectronicDocumentMigrationHistoryResponse {
  electronic_document: ElectronicDocumentFromLog;
  timeline: TimelineHistoryResponse[];
}

export interface TimelineHistoryResponse {
  step: string;
  step_name?: string;
  events: EventHistoryResponse[];
}

export interface EventHistoryResponse {
  timestamp: string;
  event: string;
  description: string;
  status: string;
  error?: string;
  proceso_estado?: number;
}
