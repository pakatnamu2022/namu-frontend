import { type Links, type Meta } from "@/shared/lib/pagination.interface";

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
  doc_number_affiliate: string | null;
  rate_with_tax: number;
  contracting_name: string | null;
  num_doc_contracting: string | null;
}
