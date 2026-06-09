export interface FoodCardResource {
  id: number;
  worker_id: number;
  period_id: number;
  amount: number;
  applies: boolean;
  num_doc: string | null;
  full_name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  worker: {
    id: number | null;
    nombre_completo: string | null;
    vat: string | null;
  } | null;
  period: {
    id: number | null;
    code: string | null;
    description: string | null;
  } | null;
}

export interface FoodCardRequest {
  worker_id: number;
  period_id: number;
  amount: number;
  applies: boolean;
}

import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface FoodCardResponse {
  data: FoodCardResource[];
  links: Links;
  meta: Meta;
}
