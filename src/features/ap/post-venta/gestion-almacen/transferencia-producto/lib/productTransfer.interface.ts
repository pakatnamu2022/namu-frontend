import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";
import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface.ts";

export interface ProductTransferResponse {
  data: ProductTransferResource[];
  links: Links;
  meta: Meta;
}

export interface ProductTransferResource {
  id: number;
  movement_number: string;
  movement_type: string;
  item_type: string;
  movement_date: string;
  warehouse_origin_id: number | null;
  warehouse_code: string | null;
  warehouse_origin: WarehouseResource | null;
  warehouse_destination_id: number;
  warehouse_destination_code: string;
  warehouse_destination: WarehouseResource | null;
  reference_type: string;
  reference_id: number;
  reference: ShipmentsReceptionsResource;
  user_id: number;
  user_name: string;
  status: string;
  notes?: string;
  total_items: number;
  total_quantity: string;
  details: ProductTransferDetailResource[];
  created_at: string;
  updated_at: string;
}

export interface ProductTransferDetailResource {
  id: number;
  inventory_movement_id: number;
  product_id: number | null;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  notes: string;
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

export interface getProductTransferProps {
  params?: Record<string, any>;
}
