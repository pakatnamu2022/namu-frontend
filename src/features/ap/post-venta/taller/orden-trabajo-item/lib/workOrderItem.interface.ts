import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface WorkOrderItemResponse {
  data: WorkOrderItemResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderItemResource {
  id: number;
  group_number: number;
  work_order_id: string;
  type_planning_id: string;
  type_planning_name: string;
  description: string;
}

export interface WorkOrderItemRequest {
  work_order_id: number;
  group_number: number;
  type_planning_id: string;
  description: string;
}

export interface getWorkOrderItemProps {
  params?: Record<string, any>;
}
