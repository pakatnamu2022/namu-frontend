import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface WorkOrderLabourResponse {
  data: WorkOrderLabourResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderLabourResource {
  id: number;
  description: string;
  time_spent: string;
  hourly_rate: string;
  total_cost: string;
  worker_id: string;
  work_order_id: string;
  worker_full_name: string;
  group_number: number;
}

export interface WorkOrderLabourRequest {
  description: string;
  time_spent: string;
  hourly_rate: string;
  work_order_id: string;
  worker_id: number;
  group_number: number;
}

export interface getWorkOrderLabourProps {
  params?: Record<string, any>;
}
