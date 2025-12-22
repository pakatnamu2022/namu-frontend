import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface PerDiemRequestResponse {
  data: PerDiemRequestResource[];
  links: Links;
  meta: Meta;
}

interface Budget {
  id: number;
  per_diem_request_id: number;
  expense_type_id: number;
  daily_amount: string;
  days: number;
  total: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface Expense {
  id: number;
  expense_date: string;
  concept: string;
  receipt_amount: number;
  company_amount: number;
  employee_amount: number;
  receipt_type: string;
  receipt_number: null | string;
  receipt_path: null | string;
  notes: null | string;
  validated: boolean;
  validated_at: null | string;
  rejected: boolean;
  rejected_at: null;
  rejection_reason: null;
  expense_type: Expensetype;
  validated_by: null | string;
  rejected_by: null;
}

interface Expensetype {
  id: number;
  code: string;
  name: string;
  full_name: string;
  description: string;
  requires_receipt: boolean;
  active: boolean;
  order: number;
  parent: Parent | null;
  created_at: string;
  updated_at: string;
}

interface Parent {
  id: number;
  code: string;
  name: string;
}

interface Hotelreservation {
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

interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface District {
  id: number;
  name: string;
  zone: string;
}

interface Company {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  full_name: string;
  position: Position;
}

interface Position {
  id: number;
  name: string;
  area: Area;
}

interface Approval {
  id: number;
  per_diem_request_id: number;
  approver_id: number;
  approver: Boss;
  status: string;
  comments: string;
  approved_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface District {
  id: number;
  name: string;
  zone: string;
}

interface Employee {
  id: number;
  full_name: string;
  position: Position;
  boss: Boss;
}

interface Boss {
  id: number;
  full_name: string;
  position: Position2;
}

interface Position2 {
  name: string;
}

interface Position {
  id: number;
  name: string;
  area: Area;
}

interface Area {
  id: number;
  name: string;
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
  employee: Employee;
  company: Company;
  district: District;
  category: Category;
  policy: string;
  approvals?: Approval[];
  hotel_reservation?: Hotelreservation;
  expenses?: Expense[];
  budgets?: Budget[];
}

interface Company {
  id: number;
  name: string;
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
  notes?: string;
  validated: boolean;
  validated_at?: string;
  expense_type: ExpenseType;
  validated_by: ValidatedBy;
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
  parent?: {
    id: number;
    code: string;
    name: string;
  };
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

export interface ReviewPerDiemRequestRequest {
  status: "approved" | "rejected";
  comments?: string;
}
