import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { PerDiemCategoryResource } from "../../categoria-viaticos/lib/perDiemCategory.interface";

export interface PerDiemRequestResponse {
  data: PerDiemRequestResource[];
  links: Links;
  meta: Meta;
}

export interface PerDiemRequestResource {
  id: number;
  code: string;
  status: string;
  start_date: string | Date;
  end_date: string | Date;
  days_count: number;
  purpose: string;
  final_result: string;
  destination: string;
  cost_center: null;
  total_budget: number;
  cash_amount: number;
  transfer_amount: number;
  paid: boolean;
  payment_date: string | Date;
  payment_method: string;
  settled: boolean;
  settlement_date: null;
  total_spent: number;
  balance_to_return: number;
  notes: null;
  days_without_settlement: number;
  employee: string;
  company: string;
  category: PerDiemCategoryResource;
  policy: string;
  approvals: ApprovalResource[];
  hotel_reservation: HotelReservationResource;
  expenses: ExpenseResource[];
}

export interface ExpenseResource {
  id: number;
  expense_date: string;
  concept: string;
  receipt_amount: number;
  company_amount: number;
  employee_amount: number;
  receipt_type: string;
  receipt_number: string;
  receipt_path: string;
  notes: null | string;
  validated: boolean;
  validated_at: null | string;
  expense_type: ExpenseType;
  validated_by: ValidatedBy | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseType {
  id: number;
  code: string;
  name: string;
  full_name: string;
  description: string;
  requires_receipt: boolean;
  active: boolean;
  order: number;
  parent: {
    id: number;
    code: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ValidatedBy {
  id: number;
  name: string;
}

export interface ExpenseRequest {
  expense_date: string | Date;
  concept: string;
  receipt_amount: number;
  company_amount: number;
  employee_amount: number;
  receipt_type: string;
  receipt_number: string;
  receipt_file?: File;
  notes?: string;
  expense_type_id: number;
}

interface HotelReservationResource {
  id: number;
  hotel_name: string;
  address: string;
  phone: string;
  checkin_date: string;
  checkout_date: string;
  nights_count: number;
  total_cost: number;
  receipt_path: string;
  notes: string;
  attended: boolean;
  penalty: number;
  created_at: string;
  updated_at: string;
}

interface ApprovalResource {
  id: number;
  per_diem_request_id: number;
  approver_id: number;
  approver_type: number;
  approver: null;
  status: string;
  comments: string;
  approved_at: string;
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
