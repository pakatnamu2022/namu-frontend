import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface SubsidyResource {
  id: number;
  worker_id: number;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  amount: string;
  reference: string | null;
  notes: string | null;
  created_by: number | null;
  created_at: string;
  worker: {
    id: number | null;
    nombre_completo: string | null;
    vat: string | null;
  };
}

export interface SubsidyCreateRequest {
  worker_id: number;
  type: string;
  start_date: string;
  end_date: string;
  amount?: number;
  reference?: string;
  notes?: string;
}

export interface SubsidyUpdateRequest {
  type?: string;
  start_date?: string;
  end_date?: string;
  amount?: number;
  reference?: string | null;
  notes?: string | null;
}

export interface SubsidyEstimate {
  amount: number;
  daily_average: number;
  months_counted: number;
  total_remuneration: number;
  days: number;
}

export interface SubsidyResponse {
  data: SubsidyResource[];
  links?: Links;
  meta: Meta;
}
