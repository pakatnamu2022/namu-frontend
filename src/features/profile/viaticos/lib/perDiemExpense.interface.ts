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
  receipt_number: string | null;
  receipt_file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  expense_type?: {
    id: number;
    name: string;
    description: string | null;
  };
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
  append(name: keyof PerDiemExpenseRequest, value: string | Blob, fileName?: string): void;
}
