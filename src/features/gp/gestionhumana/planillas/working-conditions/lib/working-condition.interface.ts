import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface WorkingConditionResponse {
  data: WorkingConditionResource[];
  links: Links;
  meta: Meta;
}

export interface WorkingConditionResource {
  id: number;
  worker_id: number;
  worker: string | null;
  period_id: number;
  period: string | null;
  amount: number;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}
