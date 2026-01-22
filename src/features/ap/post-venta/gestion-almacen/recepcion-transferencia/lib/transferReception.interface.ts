import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface TransferReceptionDetailResource {
  id: number;
  transfer_reception_id?: number;
  transfer_item_id?: number;
  product_id: number;
  quantity_sent: string | number;
  quantity_received: string | number;
  observed_quantity?: string | number;
  reason_observation?:
    | "DAMAGED"
    | "DEFECTIVE"
    | "EXPIRED"
    | "WRONG_PRODUCT"
    | "WRONG_QUANTITY"
    | "POOR_QUALITY"
    | "OTHER";
  observation_notes?: string;
  bonus_reason?: string;
  batch_number?: string;
  expiration_date?: string;
  notes?: string;
  product?: {
    id: number;
    code: string;
    name: string;
    brand_name?: string;
    category_name?: string;
    unit_measurement_name?: string;
    cost_price?: string | number;
    sale_price?: string | number;
  };
  transfer_item?: {
    id: number;
    product_id: number;
    product_name?: string;
    quantity: number;
    unit_cost?: number;
  };
}

// Interface para almacenes
interface WarehouseResource {
  id: number;
  dyn_code: string;
  description: string;
  type: string;
  status: number;
  is_received: number;
  sede_id: number;
  is_physical_warehouse: number;
  inventory_account?: string | null;
  counterparty_account?: string | null;
  article_class_id?: number | null;
  type_operation_id: number;
  parent_warehouse_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Interface para guía de remisión
interface ShippingGuideResource {
  id: number;
  document_type: string;
  issuer_type: string;
  document_series_id: number;
  series: string;
  document_number: string;
  correlative: string;
  status_nubefac: number;
  enlace: string;
  issue_date: string;
  requires_sunat: boolean;
  is_sunat_registered: boolean;
  total_packages: number;
  total_weight: string;
  vehicle_movement_id?: number | null;
  sede_transmitter_id: number;
  sede_receiver_id: number;
  transmitter_id: number;
  receiver_id: number;
  transport_company_id: number;
  ruc_transport: string;
  company_name_transport: string;
  origin_ubigeo: string;
  origin_address: string;
  destination_ubigeo: string;
  destination_address: string;
  driver_doc: string;
  license: string;
  plate: string;
  driver_name: string;
  created_by: number;
  notes: string;
  status: boolean;
  transfer_reason_id: number;
  transfer_modality_id: number;
  is_received: number;
  note_received?: string | null;
  received_by?: number | null;
  received_date?: string | null;
  enlace_del_pdf: string;
  enlace_del_xml: string;
  enlace_del_cdr: string;
  aceptada_por_sunat: boolean;
  sunat_description: string;
  sunat_responsecode: string;
  cadena_para_codigo_qr: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Interface para movimiento de transferencia
interface TransferMovementResource {
  id: number;
  movement_number: string;
  movement_type: string;
  movement_date: string;
  warehouse_origin_id: number;
  warehouse_code: string;
  warehouse_origin: WarehouseResource;
  warehouse_destination_id: number;
  warehouse_destination_code: string;
  warehouse_destination: WarehouseResource;
  reference_type: string;
  reference_id: number;
  reference: ShippingGuideResource;
  user_id: number;
  user_name: string;
  reason_in_out_id?: number | null;
  reason_in_out?: any | null;
  status: string;
  notes: string;
  total_items: number;
  total_quantity: string;
  created_at: string;
  updated_at: string;
}

export interface TransferReceptionResource {
  id: number;
  item_type: string;
  reception_number?: string;
  transfer_movement_id: number;
  shipping_guide_id: number;
  warehouse_id: number;
  reception_date: string;
  status: string;
  notes?: string;
  received_by?: number;
  reviewed_by?: number;
  reviewed_at?: string;
  total_items: number;
  total_quantity: string;
  created_at: string;
  updated_at: string;

  // Relaciones enriquecidas
  transfer_movement: TransferMovementResource;
  shipping_guide: ShippingGuideResource;
  warehouse: WarehouseResource;
  received_name?: string;
  reviewer_name?: string;

  // Detalles de recepción
  details: Array<{
    id: number;
    transfer_reception_id: number;
    product_id: number;
    quantity_sent: string;
    quantity_received: string;
    observed_quantity: string;
    reason_observation?: string | null;
    observation_notes?: string | null;
    created_at: string;
    updated_at: string;
    product: {
      id: number;
      code: string;
      name: string;
      description: string;
      unit_type?: string | null;
    };
    quantity_accepted: number;
    has_observations: boolean;
    observation_percentage: number;
  }>;

  // Métricas calculadas
  has_observations: boolean;
  total_observed_quantity: number;
  is_fully_received: boolean;
  completion_percentage: number;
}

// Interface para el listado (datos resumidos)
export interface TransferReceptionListItem {
  id: number;
  reception_number?: string;
  transfer_movement_id: number;
  reception_date: string;
  warehouse_id: number;
  notes?: string;
  received_by?: number;
  received_by_user_name?: string;
  total_items?: number;
  total_quantity?: string;
  status?: string;
}

export interface TransferReceptionResponse {
  data: TransferReceptionListItem[];
  links: Links;
  meta: Meta;
}

export interface TransferReceptionDetailRequest {
  transfer_item_id?: string;
  product_id?: string;
  quantity_sent: number;
  quantity_received: number;
  observed_quantity?: number;
  reason_observation?:
    | "DAMAGED"
    | "DEFECTIVE"
    | "EXPIRED"
    | "WRONG_PRODUCT"
    | "WRONG_QUANTITY"
    | "POOR_QUALITY"
    | "OTHER";
  observation_notes?: string;
  bonus_reason?: string;
  notes?: string;
}

export interface TransferReceptionRequest {
  transfer_movement_id: string;
  reception_date: string | Date;
  warehouse_id: string;
  notes?: string;
  details: TransferReceptionDetailRequest[];
}

export interface getTransferReceptionsProps {
  params?: Record<string, any>;
  productTransferId?: number;
}
