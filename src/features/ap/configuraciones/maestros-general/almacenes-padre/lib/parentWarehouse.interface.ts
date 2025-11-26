import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ParentWarehouseResponse {
  data: ParentWarehouseResource[];
  links: Links;
  meta: Meta;
}

export interface ParentWarehouseResource {
  id: number;
  dyn_code: string;
  sede_id: number;
  sede: string;
  type_operation_id: number;
  type_operation: string;
  is_received: boolean;
  status: boolean | null;
}

export interface ParentWarehouseRequest {
  dyn_code: string;
  sede_id: number;
  type_operation_id: number;
  is_received: boolean;
}

export interface getParentWarehouseProps {
  params?: Record<string, any>;
}
