import { AP_MASTER_POST_VENTA } from "@/features/ap/lib/ap.constants";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export type MovementType =
  | typeof AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_IN
  | typeof AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_OUT;

export interface AdjustmentsProductDetailResource {
  id: number;
  inventory_movement_id?: number;
  product_id: number;
  quantity: string | number;
  unit_cost?: string | number;
  batch_number?: string;
  expiration_date: string | Date;
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
}

export interface AdjustmentsProductResource {
  id: number;
  movement_number?: string;
  movement_type: MovementType;
  adjustment_reason_id?: number;
  warehouse_id: number;
  movement_date: string;
  notes?: string;
  created_by?: number;
  created_by_user_name?: string;
  total_items?: number;
  total_quantity?: string;
  total_cost?: string;
  status?: string;
  warehouse?: {
    id: number;
    description: string;
  };
  adjustment_reason?: {
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
  warehouse_id: number;
  movement_date: string | Date;
  notes?: string;
  created_by?: number;
  created_by_user_name?: string;
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
  adjustment_reason_id: string;
  warehouse_id: string;
  movement_date: string | Date;
  notes?: string;
  details: AdjustmentsProductDetailRequest[];
}

export interface getAdjustmentsProductProps {
  params?: Record<string, any>;
  movementType?: MovementType;
}
