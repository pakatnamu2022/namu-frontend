import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface SctrRateResource {
  id: number;
  company_id: number;
  company: string | null;
  health_rate: string;
  pension_rate: string;
  effective_from: string;
  effective_to: string | null;
  is_current: boolean;
  created_by: number | null;
  created_at: string;
}

export interface SctrRateRequest {
  company_id: number;
  health_rate: number;
  pension_rate: number;
  effective_from: string;
}

export interface SctrRateResponse {
  data: SctrRateResource[];
  links?: Links;
  meta: Meta;
}
