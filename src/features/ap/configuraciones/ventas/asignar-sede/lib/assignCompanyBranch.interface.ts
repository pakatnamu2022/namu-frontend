import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface AssignCompanyBranchResponse {
  data: AssignCompanyBranchResource[];
  links: Links;
  meta: Meta;
}

export interface AssignCompanyBranchResource {
  year: number;
  month: number;
  sede_id: number;
  assigned_workers: AsesorResource[];
}

export interface AssignCompanyBranchRequest {
  sede_id: number;
  assigned_workers: number[];
}

export interface AsesorResource {
  id: number;
  name: string;
}

export interface getAssignCompanyBranchProps {
  params?: Record<string, any>;
}
