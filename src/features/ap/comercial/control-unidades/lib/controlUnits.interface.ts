import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ControlUnitsResponse {
  data: ControlUnitsResource[];
  links: Links;
  meta: Meta;
}

export interface ControlUnitsResource {
  id: number;
  ap_vehicle_id: string;
  document_type: string;
  issuer_type: string;
  document_series_id: string;
  series: string;
  correlative: string;
  document_number: string;
  issue_date: string;
  requires_sunat: boolean;
  is_sunat_registered: boolean;
  transmitter_id: string;
  transmitter_name?: string;
  receiver_id: string;
  receiver_name?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  driver_doc: string;
  company_name: string;
  license: string;
  plate: string;
  driver_name: string;
  notes: string;
  transfer_reason_id: string;
  transfer_modality_id: string;
  vehicle_movement?: VehicleMovementResource;
  reception_checklist?: ReceptionChecklistResource;
  sede_transmitter_id?: string;
  sede_receiver_id?: string;
  transmitter_origin_id?: string;
  receiver_destination_id?: string;
  total_packages?: number;
  total_weight?: number;
  transport_company_id?: string;
  transmitter_establishment?: EstablishmentResource;
  receiver_establishment?: EstablishmentResource;
  sent_at?: string | null;
  enlace_del_pdf?: string | null;
  enlace_del_xml?: string | null;
  enlace_de_la_cdr?: string | null;
  enlace_del_cdr?: string | null;
  cadena_para_codigo_qr?: string | null;
  aceptada_por_sunat?: boolean | null;
  sunat_description?: string | null;
  status_dynamic?: boolean | null;
  is_received?: boolean | null;
  ap_class_article_id?: string | null;
  sede_transmitter?: string;
  sede_receiver?: string;
  transmitter_description?: string;
  receiver_description?: string;
  transfer_modality_description?: string;
  transfer_reason_description?: string;
  note_received?: string;
  destination_ubigeo?: string;
  destination_address?: string;
  ruc_transport?: string;
  company_name_transport?: string;
  status?: boolean;
  is_consignment?: boolean | null;
  receiving_checklists: any[];
  items: ShipmentItemResource[];
}

export interface ShipmentItemResource {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: string;
}

export interface EstablishmentResource {
  id: number;
  code: string;
  description?: string;
  full_address: string;
}

export interface ControlUnitsRequest {
  ap_vehicle_id: string;
  document_type: string;
  issuer_type: string;
  document_series_id?: string;
  issue_date?: string | Date;
  sede_transmitter_id: string;
  sede_receiver_id?: string;
  transmitter_origin_id?: string;
  receiver_destination_id?: string;
  transmitter_id?: string;
  receiver_id?: string;
  total_packages: string;
  total_weight: string;
  file?: File | null;
  transport_company_id: string;
  driver_doc: string;
  license: string;
  plate: string;
  driver_name: string;
  notes?: string;
  transfer_reason_id: string;
  transfer_modality_id: string;
}

export interface getControlUnitsProps {
  params?: Record<string, any>;
}

// Interfaces relacionadas
export interface VehicleMovementResource {
  id: string;
  movement_type: string;
  origin: string;
  destination: string;
  departure_date: string;
  arrival_date?: string;
}

// Checklist de recepción
export interface ReceptionChecklistResponse {
  note_received: string;
  data: ReceptionChecklistResource[];
  accessories: AccessoryResource[];
}

export interface ReceptionChecklistResource {
  id: number;
  receiving_id: number;
  receiving_description: string;
  quantity: number;
}

export interface AccessoryResource {
  id: number;
  description: string;
  quantity: number;
  unit_price: string;
  total: string;
  unit_measurement: string;
}

export interface ReceptionChecklistRequest {
  items_receiving: Record<string, string>;
  shipping_guide_id: string;
  note?: string;
}
