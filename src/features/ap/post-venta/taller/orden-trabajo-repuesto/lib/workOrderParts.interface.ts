import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface WorkOrderPartsResponse {
  data: WorkOrderPartsResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderPartsResource {
  id: number;
  work_order_id: number;
  group_number: number;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity_used: number;
  is_delivered: boolean;
}

export interface WorkOrderPartsRequest {
  id: number;
  work_order_id: number;
  group_number: number;
  product_id: string;
  warehouse_id: string;
  quantity_used: number;
}

export interface getWorkOrderPartsProps {
  params?: Record<string, any>;
}
