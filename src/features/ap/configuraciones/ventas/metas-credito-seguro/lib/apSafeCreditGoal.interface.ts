import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface ApSafeCreditGoalResponse {
  data: ApSafeCreditGoalResource[];
  links: Links;
  meta: Meta;
  meta_sell_in?: number;
  meta_sell_out?: number;
  shop?: string;
}

export interface ApSafeCreditGoalResource {
  id: number;
  year: number;
  month: number;
  goal_amount: number;
  type: string;
  sede_id: string;
}

export interface ApSafeCreditGoalRequest {
  year: number;
}

export interface getApSafeCreditGoalProps {
  params?: Record<string, any>;
}
