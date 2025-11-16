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
}

export interface AccountingAccountPlanRequest {
  account: string;
  description: string;
  accounting_type_id: number;
  status: boolean;
}

export interface getAccountingAccountPlanProps {
  params?: Record<string, any>;
}
