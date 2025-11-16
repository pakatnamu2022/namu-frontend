import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface AccountingAccountTypeResponse {
  data: AccountingAccountTypeResource[];
  links: Links;
  meta: Meta;
}

export interface AccountingAccountTypeResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface AccountingAccountTypeRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getAccountingAccountTypeProps {
  params?: Record<string, any>;
}
