import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface OperatorWorkOrderResponse {
  data: OperatorWorkOrderResource[];
  links: Links;
  meta: Meta;
}

export interface OperatorWorkOrderResource {
  id: number;
  work_order_id: number;
  group_number: number;
  operator_id: string;
  operator_name: string;
  observations: string;
  status: string;
}

export interface OperatorWorkOrderRequest {
  work_order_id: number;
  group_number: number;
  operator_id: string;
  observations: string;
}

export interface getOperatorWorkOrderProps {
  params?: Record<string, any>;
}
