import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface AccountingAccountPlanResponse {
  data: AccountingAccountPlanResource[];
  links: Links;
  meta: Meta;
}

export interface AccountingAccountPlanDetractionType {
  id: number;
  code_nubefact: string;
  description: string;
  type: string;
  prefix: string | null;
  length: number | null;
  tribute_code: string | null;
  affects_total: boolean | null;
  iso_code: string;
  symbol: string | null;
  percentage: string;
}

export interface AccountingAccountPlanResource {
  id: number;
  account: string;
  code_dynamics: string;
  description: string;
  is_detraction: boolean;
  detraction_percentage: number | null;
  sunat_concept_detraction_type_id: number | null;
  detraction_type: AccountingAccountPlanDetractionType | null;
  status: number;
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
