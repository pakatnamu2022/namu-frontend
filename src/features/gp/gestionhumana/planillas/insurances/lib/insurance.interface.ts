import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type InsuranceStatus = "ACTIVO" | "INACTIVO";

export interface InsuranceResponse {
  data: InsuranceResource[];
  links: Links;
  meta: Meta;
}

export interface InsuranceResource {
  id: number;
  worker_id: number;
  worker: string | null;
  period_id: number;
  period: string | null;
  business_partner_id: number;
  business_partner: string | null;
  family_group_number: string | null;
  relationship: string | null;
  doc_type_affiliate: string | null;
  doc_number_affiliate: string | null;
  gender: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  first_name: string | null;
  second_name: string | null;
  entry_date: string | null;
  birth_date: string | null;
  condition: string | null;
  program: string | null;
  plan: string | null;
  payment_frequency: string | null;
  type: string | null;
  rate_without_tax: number;
  tax: number;
  rate_with_tax: number;
  period_from: string | null;
  period_until: string | null;
  affiliation_continuity_date: string | null;
  affiliation_from: string | null;
  affiliation_until: string | null;
  status: InsuranceStatus;
}

export interface InsuranceRequest {
  worker_id: number;
  period_id: number;
  business_partner_id: number;
  family_group_number: string;
  relationship: string;
  doc_type_affiliate: string;
  doc_number_affiliate: string;
  gender: string;
  paternal_surname: string;
  maternal_surname: string;
  first_name: string;
  second_name: string;
  entry_date: string;
  birth_date: string;
  condition: string;
  program: string;
  plan: string;
  payment_frequency: string;
  type: string;
  rate_without_tax: number;
  tax: number;
  rate_with_tax: number;
  period_from: string;
  period_until: string;
  affiliation_continuity_date: string;
  affiliation_from: string;
  affiliation_until: string;
  status: InsuranceStatus;
}
