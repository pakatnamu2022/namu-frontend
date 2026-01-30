import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PhoneLineResponse {
  data: PhoneLineResource[];
  links: Links;
  meta: Meta;
}

export interface PhoneLineResource {
  id: number;
  number: string;
  status: string;
  is_active: string;
  telephone_account_id: string;
  telephone_plan_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface PhoneLineRequest {
  telephone_account_id: string;
  telephone_plan_id: string;
  line_number: string;
  status: string;
  is_active: boolean;
}

export interface getPhoneLinesProps {
  params?: Record<string, any>;
}
