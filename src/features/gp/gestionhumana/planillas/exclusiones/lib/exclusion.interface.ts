import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ExclusionResource {
  id: number;
  worker_id: number;
  period_id: number;
  concept: string;
  reason: string | null;
  created_by: number | null;
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

export interface ExclusionRequest {
  worker_id: number;
  period_id: number;
  concept: string;
  reason?: string;
}

export interface ExclusionResponse {
  data: ExclusionResource[];
  links?: Links;
  meta: Meta;
}
