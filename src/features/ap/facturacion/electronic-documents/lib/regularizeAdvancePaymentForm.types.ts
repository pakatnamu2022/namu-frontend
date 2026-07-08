import { ElectronicDocumentItemSchema } from "./electronicDocument.schema";

// Tipo de estado del formulario de Regularización de Anticipos.
// Los items reutilizan ElectronicDocumentItemSchema (y por lo tanto ItemsSection/
// ElectronicDocumentItemsTable) aunque el payload final que se envía al backend
// (RegularizeAdvancePaymentSchema) solo usa un subset de esos campos.
export interface RegularizeAdvancePaymentFormValues {
  sunat_concept_document_type_id: string;
  sede_id: string;
  serie: string;
  numero: number;

  origin_entity_type: "ApOrderQuotations" | "ApWorkOrder" | "";
  origin_entity_id?: string;
  order_quotation_id?: string;
  work_order_id?: string;

  client_id: string;

  fecha_de_emision: string;
  fecha_de_vencimiento?: string;

  sunat_concept_currency_id: string;

  total_gravada?: number;
  total_inafecta?: number;
  total_exonerada?: number;
  total_igv?: number;
  total: number;

  observaciones?: string;
  condiciones_de_pago?: string;
  medio_de_pago?: string;
  bank_id?: string;
  operation_number?: string;
  orden_compra_servicio?: string;

  items: ElectronicDocumentItemSchema[];
}
