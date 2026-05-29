import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type LoanStatus = "ACTIVO" | "COMPLETADO" | "ANULADO";

export interface LoanResponse {
  data: LoanResource[];
  links: Links;
  meta: Meta;
}

export interface LoanResource {
  id: number;
  concept_id: number;
  concept: string | null;
  worker_id: number;
  worker: string | null;
  delivery_date: string;
  reason: string;
  payment_start: string;
  loan_amount: number;
  installments_count: number;
  installment_amount: number;
  status: LoanStatus;
}

export interface LoanRequest {
  concept_id: number;
  worker_id: number;
  delivery_date: string;
  reason: string;
  payment_start: string;
  loan_amount: number;
  installments_count: number;
  installment_amount: number;
  status: LoanStatus;
}
