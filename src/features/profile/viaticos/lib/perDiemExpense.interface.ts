export interface PerDiemExpenseResource {
  id: number;
  per_diem_request_id: number;
  expense_type_id: number;
  expense_date: string;
  concept: string;
  receipt_amount: number;
  company_amount: number;
  employee_amount: number;
  receipt_type: "invoice" | "ticket" | "no_receipt";
  receipt_number?: string;
  receipt_path?: string;
  notes?: string;
  business_name?: string;
  ruc?: string;
  is_company_expense: boolean;
  validated: boolean;
  validated_at?: string;
  rejected: boolean;
  rejected_at?: string;
  rejection_reason?: string;
  expense_type: ExpenseType;
  rejected_by?: number;
  validated_by?: number;
}

interface ExpenseType {
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
  children_count?: number;
}

export interface PerDiemExpenseRequest {
  expense_date: string;
  expense_type_id: string;
  concept: string;
  receipt_amount: number;
  company_amount: number;
  employee_amount: number;
  receipt_type: "invoice" | "ticket" | "no_receipt";
  receipt_number?: string;
  receipt_file?: File;
  notes?: string;
}

export interface PerDiemExpenseFormData extends FormData {
  append(
    name: keyof PerDiemExpenseRequest,
    value: string | Blob,
    fileName?: string
  ): void;
}

export interface RemainingBudgetResponse {
  success: boolean;
  data: {
    per_diem_request_id: number;
    expense_type_id: number;
    date: string;
    daily_amount: string;
    total_spent_on_date: number;
    remaining_budget: number;
    is_over_budget: boolean;
  };
}
