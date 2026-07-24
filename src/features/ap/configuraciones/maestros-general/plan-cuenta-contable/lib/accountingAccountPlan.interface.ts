import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface AccountingAccountPlanResponse {
  data: AccountingAccountPlanResource[];
  links: Links;
  meta: Meta;
}

export interface AccountingAccountPlanResource {
  id: number;
  account: string;
  code_dynamics: string;
  description: string;
  accounting_type_id: number;
  status: boolean;
  is_detraction: boolean;
  detraction_percentage: number | null;
  sunat_concept_detraction_type_id: number | null;
  detraction_type?: {
    id: number;
    description: string;
    code_nubefact: string;
  } | null;
  enable_commercial: boolean;
  enable_after_sales: boolean;
}

export interface AccountingAccountPlanRequest {
  account: string;
  description: string;
  accounting_type_id: number;
  status: boolean;
  is_detraction: boolean;
  detraction_percentage: number | null;
  sunat_concept_detraction_type_id: number | null;
  enable_commercial: boolean;
  enable_after_sales: boolean;
}

export interface getAccountingAccountPlanProps {
  params?: Record<string, any>;
}
