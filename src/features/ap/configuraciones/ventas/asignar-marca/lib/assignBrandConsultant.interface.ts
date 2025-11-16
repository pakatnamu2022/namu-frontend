import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface AssignBrandConsultantResponse {
  data: AssignBrandConsultantResource[];
  links: Links;
  meta: Meta;
  meta_sell_in?: number;
  meta_sell_out?: number;
  shop?: string;
}

export interface AssignBrandConsultantResource {
  id: number;
  year: number;
  month: number;
  company_branch_id: number;
  sede_id: number;
  brand_id: number;
  worker_id: number;
  status: boolean;
  sales_target: number;
}

export interface AssignBrandConsultantRequest {
  company_branch_id: number;
  workers: number[];
}

export interface AsesorResource {
  id: number;
  name: string;
}

export interface BrandResource {
  id: number;
  name: string;
}

export interface getAssignBrandConsultantProps {
  params?: Record<string, any>;
}
