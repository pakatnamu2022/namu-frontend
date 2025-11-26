import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ProductTransferResponse {
  data: ProductTransferResource[];
  links: Links;
  meta: Meta;
}

export interface ProductTransferResource {
  id: number;
  warehouse_origin_id: number;
  warehouse_destination_id: number;
  document_series_id: number;
  movement_date: string;
  notes?: string;
  driver_name: string;
  driver_doc: string;
  license: string;
  plate: string;
  transfer_reason_id: number;
  transfer_modality_id: number;
  transport_company_id: number;
  total_packages: number;
  total_weight: number;
  destination_ubigeo: string;
  destination_address: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;

  // Relaciones
  warehouse_origin?: WarehouseResource;
  warehouse_destination?: WarehouseResource;
  reason_in_out?: ReasonInOutResource;
  transfer_reason?: TransferReasonResource;
  transfer_modality?: TransferModalityResource;
  transport_company?: TransportCompanyResource;
  details?: ProductTransferDetailResource[];
}

export interface WarehouseResource {
  id: number;
  description: string;
  sede?: string;
  sede_id?: number;
}

export interface ReasonInOutResource {
  id: number;
  description: string;
}

export interface TransferReasonResource {
  id: number;
  description: string;
}

export interface TransferModalityResource {
  id: number;
  description: string;
}

export interface TransportCompanyResource {
  id: number;
  full_name: string;
  ruc?: string;
}

export interface ProductTransferDetailResource {
  id: number;
  product_transfer_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  notes?: string;
  product?: ProductResource;
}

export interface ProductResource {
  id: number;
  description: string;
  code?: string;
}

export interface ProductTransferRequest {
  warehouse_origin_id: string;
  warehouse_destination_id: string;
  movement_date: string | Date;
  notes?: string;
  driver_name: string;
  driver_doc: string;
  license: string;
  plate: string;
  transfer_reason_id: string;
  transfer_modality_id: string;
  transport_company_id: string;
  total_packages: string;
  total_weight: string;
  details: ProductTransferDetailRequest[];
}

export interface ProductTransferDetailRequest {
  product_id: string;
  quantity: string;
  unit_cost: string;
  notes?: string;
}

export interface getProductTransferProps {
  params?: Record<string, any>;
}
