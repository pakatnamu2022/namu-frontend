import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface ApBankResponse {
  data: ApBankResource[];
  links: Links;
  meta: Meta;
}

export interface ApBankResource {
  id: number;
  code: string;
  account_number: string;
  cci: string;
  bank_id: number;
  currency_id: number;
  company_branch_id: number;
  sede_id: number;
  status: boolean;
}

export interface ApBankRequest {
  code: string;
  account_number: string;
  cci: string;
  bank_id: number;
  currency_id: number;
  company_branch_id: number;
  sede_id: number;
  status: boolean;
}

export interface getApBankProps {
  params?: Record<string, any>;
}
