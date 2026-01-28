import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PayrollConceptResponse {
  data: PayrollConceptResource[];
  links: Links;
  meta: Meta;
}

export interface PayrollConceptResource {
  id: number;
  code: string;
  name: string;
  description: string;
  type: PayrollConceptType;
  category: PayrollConceptCategory;
  formula: string;
  formula_description: string;
  is_taxable: boolean;
  calculation_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type PayrollConceptType = "EARNING" | "DEDUCTION" | "CONTRIBUTION";

export type PayrollConceptCategory =
  | "BASE_SALARY"
  | "BONUS"
  | "OVERTIME"
  | "ALLOWANCE"
  | "COMMISSION"
  | "TAX"
  | "SOCIAL_SECURITY"
  | "PENSION"
  | "LOAN"
  | "OTHER";

export interface GetPayrollConceptsProps {
  params?: Record<string, unknown>;
}
