import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface PerDiemRequestResponse {
  data: PerDiemRequestResource[];
  links: Links;
  meta: Meta;
}

export interface PerDiemRequestResource {
  id: number;
  code: string;
  per_diem_policy_id: string;
  employee_id: string;
  company_id: string;
  per_diem_category_id: boolean;
  start_date: string | Date;
  end_date: string | Date;
  days_count: number;
  purpose: string;
  final_result: string;
  status: string;
  total_budget: number;
  cash_amount: number;
  transfer_amount: number;
  paid: boolean;
  payment_date: string | Date;
  payment_method: string;
  settled: boolean;
  settlement_date: string | Date;
  total_spent: number;
  balance_to_return: number;
  notes: string;
}

export interface PerDiemRequestRequest {
  per_diem_policy_id: string;
  employee_id: string;
  company_id: string;
  per_diem_category_id: boolean;
  start_date: string | Date;
  end_date: string | Date;
  purpose: string;
  final_result: string;
  total_budget: number;
  cash_amount: number;
  transfer_amount: number;
  payment_method: string;
  notes: string;
}

export interface getPerDiemRequestProps {
  params?: Record<string, any>;
}
