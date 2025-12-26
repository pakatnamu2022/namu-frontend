import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ExpenseTypeResponse {
  data: ExpenseTypeResource[];
  links: Links;
  meta: Meta;
}

export interface ExpenseTypeResource {
  id: number;
  code: string;
  name: string;
  full_name: string;
  description: string;
  requires_receipt: boolean;
  active: boolean;
  order: number;
  parent?: ExpenseTypeParent;
  children_count?: number;
}

export interface ExpenseTypeParent {
  id: number;
  code: string;
  name: string;
}

export interface ExpenseTypeRequest {
  code: string;
  name: string;
  full_name: string;
  description?: string;
  requires_receipt: boolean;
  active: boolean;
  order: number;
  parent_id?: number | null;
}

export interface getExpenseTypeProps {
  params?: Record<string, any>;
}
