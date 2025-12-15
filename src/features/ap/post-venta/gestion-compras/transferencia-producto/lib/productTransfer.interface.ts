import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { ProductResource } from "../../../gestion-productos/productos/lib/product.interface";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface";

export interface ProductTransferResponse {
  data: ProductTransferResource[];
  links: Links;
  meta: Meta;
}

export interface ProductTransferResource {
  id: number;
  warehouse_origin_id: number;
  warehouse_destination_id: number;
  item_type: "PRODUCTO" | "SERVICIO";
  reference_id: number; // ID de la guía de remisión
  reference: ShipmentsReceptionsResource; // Relación con guía de remisión
  movement_date: string;
  notes?: string;
  driver_name: string;
  driver_doc: string;
  license: string;
  plate: string;
  transfer_reason_id: number;
  destination_ubigeo: string;
  destination_address: string;
  status?: string;
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

export interface TransferDetail {
  id: number;
  inventory_movement_id: number;
  product_id: number;
  quantity: string;
  unit_cost: string;
  total_cost: string;
  notes?: string;
  product: {
    id: number;
    code: string;
    dyn_code: string;
    name: string;
    description: string;
    cost_price: string;
    sale_price: string;
  };
}

export interface TransferData {
  id: number;
  movement_number: string;
  movement_type: string;
  movement_date: string;
  warehouse_id: number;
  warehouse_code: string;
  item_type: string;
  warehouse_origin: {
    id: number;
    dyn_code: string;
    description: string;
    sede_id: number;
  };
  warehouse_destination_id: number;
  warehouse_destination_code: string;
  warehouse_destination: {
    id: number;
    dyn_code: string;
    description: string;
    sede_id: number;
  };
  reference_id: number;
  reference: {
    id: number;
    document_number: string;
    document_type: string;
    issue_date: string;
    plate: string;
    driver_name: string;
    license: string;
    total_packages: number;
    total_weight: string;
    transfer_reason_description?: string;
    transfer_modality_description?: string;
    requires_sunat: boolean;
    is_sunat_registered: boolean;
    sent_at: string | null;
    aceptada_por_sunat: boolean | null;
    enlace_del_pdf: string | null;
    enlace_del_xml: string | null;
    enlace_del_cdr: string | null;
    cadena_para_codigo_qr: string | null;
    notes?: string;
  };
  user_id: number;
  user_name: string;
  status: string;
  notes: string;
  total_items: number;
  total_quantity: string;
  details: TransferDetail[];
  created_at: string;
  updated_at: string;
}

export interface getProductTransferProps {
  params?: Record<string, any>;
}
