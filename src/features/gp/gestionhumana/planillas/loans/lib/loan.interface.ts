import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface LoanResponse {
  data: LoanResource[];
  links: Links;
  meta: Meta;
}

export interface LoanResource {
  id: number;
  worker_id: number;
  worker: string | null;
  delivery_date: string | null;
  reason: string | null;
  payment_start: string | null;
  payment_days: number[] | null;
  loan_amount: string;
  installments_count: number | null;
  installment_amount: string;
  remaining_balance: number;
  status: boolean;
}

export interface LoanRequest {
  worker_id: number;
  delivery_date?: string | null;
  reason?: string | null;
  payment_start?: string | null;
  payment_days?: number[] | null;
  loan_amount: number;
  installments_count?: number | null;
  installment_amount: number;
  status?: boolean | null;
}

export interface LoanExtraDiscountRequest {
  loan_id: number;
  concept_type_id: string;
  amount: number;
  scheduled_date?: string | null;
  month_number?: number | null;
  applied?: boolean | null;
}

export interface LoanExtraDiscountResource {
  id: number;
  loan_id: number;
  loan: string | null;
  concept_type: string;
  amount: number;
  month_number: number | null;
  applied: boolean;
  confirmed_by: number | null;
  confirmed_by_name: string | null;
  confirmed_at: string | null;
  scheduled_date: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface LoanDetailResource extends LoanResource {
  extra_discounts: LoanExtraDiscountResource[];
}
