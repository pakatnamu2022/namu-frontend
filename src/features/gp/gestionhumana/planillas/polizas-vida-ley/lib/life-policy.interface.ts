import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface LifePolicyWorker {
  id: number;
  worker_id: number;
  nombre_completo: string | null;
  vat: string | null;
  insured_salary: string;
  net_cost: number;
  total_with_igv: number;
  monthly_amount: number;
}

export interface LifePolicyResource {
  id: number;
  company_id: number;
  company: string | null;
  insurer: string | null;
  policy_number: string | null;
  start_date: string;
  end_date: string;
  days: number;
  monthly_rate: string;
  igv_rate: string;
  exclusion: string;
  total_insured_salary: string;
  net_premium: string;
  workers_count: number | null;
  workers?: LifePolicyWorker[];
  created_by: number | null;
  created_at: string;
}

export interface LifePolicyRequest {
  company_id: number;
  insurer?: string;
  policy_number?: string;
  start_date: string;
  end_date: string;
  monthly_rate?: number;
  exclusion?: number;
  net_premium?: number;
}

export interface LifePolicyWorkerRequest {
  worker_id: number;
  insured_salary?: number;
}

export interface LifePolicyResponse {
  data: LifePolicyResource[];
  links?: Links;
  meta: Meta;
}

export interface LifePolicyStoreResult {
  policy: { data?: LifePolicyResource } | LifePolicyResource;
  skipped: { worker_id: number; nombre_completo: string; reason: string }[];
}
