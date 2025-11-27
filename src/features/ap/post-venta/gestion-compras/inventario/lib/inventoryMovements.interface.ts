import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface InventoryMovementResource {
  id: number;
  movement_date: string;
  movement_type: string;
  movement_number: string;
  document_type?: string;
  document_number?: string;
  quantity_in: number;
  quantity_out: number;
  balance: number;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  user_name?: string;
  warehouse_origin?: string;
  warehouse_destination?: string;
  supplier?: string;
  customer?: string;
  created_at: string;
}

export interface InventoryMovementResponse {
  data: InventoryMovementResource[];
  links: Links;
  meta: Meta;
}

export interface getInventoryMovementProps {
  productId: number;
  warehouseId: number;
  params?: Record<string, any>;
}
