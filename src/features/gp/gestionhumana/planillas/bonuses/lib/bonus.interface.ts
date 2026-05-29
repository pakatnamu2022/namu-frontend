import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface BonusResponse {
  data: BonusResource[];
  links: Links;
  meta: Meta;
}

export interface BonusResource {
  id: number;
  worker_id: number;
  worker: string | null;
  period_id: number;
  period: string | null;
  amount: number;
  type_id: number;
  type: string | null;
}

export interface BonusRequest {
  worker_id: number;
  period_id: number;
  amount: number;
  type_id: number;
}
