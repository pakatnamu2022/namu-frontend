import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PlansResponse {
  data: PlansResource[];
  links: Links;
  meta: Meta;
}

export interface PlansResource {
  id: number;
  brand_id: number | null;
  brand?: { id: number; name: string } | null;
  name: string;
  concept: string | null;
  year: number;
  description: string | null;
  status: string | null;
  budgets?: unknown[];
  created_by?: number;
  created_at?: string;
}

export interface getPlansProps {
  params?: Record<string, any>;
}
