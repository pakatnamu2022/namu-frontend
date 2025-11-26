import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface WarehouseResponse {
  data: WarehouseResource[];
  links: Links;
  meta: Meta;
}

export interface WarehouseResource {
  id: number;
  dyn_code: string;
  description: string;
  article_class_id: number;
  article_class: string;
  sede_id: number;
  sede: string;
  type_operation_id: number;
  type_operation: string;
  counterparty_account: string;
  inventory_account: string;
  is_received: boolean;
  parent_warehouse_id: string;
  status: boolean | null;
}

export interface WarehouseRequest {
  dyn_code: string;
  description: string;
  sede_id: number;
  type_operation_id: number;
  article_class_id: number;
  is_received: boolean;
}

export interface getWarehouseProps {
  params?: Record<string, any>;
}
