import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface TelephoneAccountResponse {
  data: TelephoneAccountResource[];
  links: Links;
  meta: Meta;
}

export interface TelephoneAccountResource {
  id: string;
  company_id: string;
  company: string;
  account_number: string;
  operator: string;
}

export interface TelephoneAccountRequest {
  company_id: number;
  account_number: string;
  operator: string;
}

export interface getTelephoneAccountsProps {
  params?: Record<string, any>;
}
