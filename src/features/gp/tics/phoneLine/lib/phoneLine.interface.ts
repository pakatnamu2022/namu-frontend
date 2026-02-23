import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { TelephonePlanResource } from "../../telephonePlan/lib/telephonePlan.interface";
import { TelephoneAccountResource } from "../../telephoneAccount/lib/telephoneAccount.interface";

export interface PhoneLineResponse {
  data: PhoneLineResource[];
  links: Links;
  meta: Meta;
}

export interface PhoneLineResource {
  id: number;
  line_number: string;
  company: string;
  active_assignment?: ActiveAssignment;
  is_active: boolean;
  telephone_account_id: number;
  telephone_plan_id: number;
  company_id: number;
  telephone_account: TelephoneAccountResource;
  telephone_plan: TelephonePlanResource;
}

export interface ActiveAssignment {
  id: number;
  phone_line_id: number;
  worker_id: number;
  worker_name: string;
  assigned_at: string;
  unassigned_at?: string;
  active: boolean;
}

export interface PhoneLineWorkerResource {
  id: number;
  phone_line_id: number;
  worker_id: number;
  worker_name: string;
  assigned_at: string;
  unassigned_at?: string;
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
