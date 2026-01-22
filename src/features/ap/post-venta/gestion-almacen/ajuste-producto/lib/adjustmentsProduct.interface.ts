import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";

export type MovementType =
  | typeof AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN
  | typeof AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT;

export interface AdjustmentsProductDetailResource {
  id: number;
  inventory_movement_id?: number;
  product_id: number;
  quantity: string | number;
  unit_cost?: string | number;
  batch_number?: string;
  expiration_date: string | Date;
  notes?: string;
  product?: ProductResource;
}

export interface AdjustmentsProductResource {
  id: number;
  movement_number?: string;
  movement_type: MovementType;
  reason_in_out_id?: number;
  warehouse_origin_id: number;
  movement_date: string;
  notes?: string;
  user_id?: number;
  user_name?: string;
  total_items?: number;
  total_quantity?: string;
  total_cost?: string;
  status?: string;
  warehouse_origin?: WarehouseResource;
  reason_in_out?: {
    id: number;
    code: string;
    description: string;
    type: string;
  };
  details?: AdjustmentsProductDetailResource[];
  created_at?: string;
  updated_at?: string;
}

// Interface para el listado (datos resumidos)
export interface AdjustmentsProductListItem {
  id: number;
  movement_number?: string;
  movement_type: MovementType;
  warehouse_origin_id: number;
  movement_date: string | Date;
  notes?: string;
  user_id?: number;
  user_name?: string;
  total_items?: number;
  total_quantity?: string;
  total_cost?: string;
  status?: string;
}

export interface AdjustmentsProductResponse {
  data: AdjustmentsProductListItem[];
  links: Links;
  meta: Meta;
}

export interface AdjustmentsProductDetailRequest {
  product_id: string;
  quantity: number;
  unit_cost?: number;
  batch_number?: string;
  expiration_date?: string | Date;
  notes?: string;
}

export interface AdjustmentsProductRequest {
  movement_type: MovementType;
  reason_in_out_id: string;
  warehouse_id: string;
  movement_date: string | Date;
  notes?: string;
  details: AdjustmentsProductDetailRequest[];
}

export interface getAdjustmentsProductProps {
  params?: Record<string, any>;
  movementType?: MovementType;
}
