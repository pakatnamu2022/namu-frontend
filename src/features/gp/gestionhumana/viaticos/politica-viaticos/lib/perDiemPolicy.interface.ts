import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface PerDiemPolicyResponse {
  data: PerDiemPolicyResource[];
  links: Links;
  meta: Meta;
}

export interface PerDiemPolicyResource {
  id: number;
  version: string;
  name: string;
  effective_from: string;
  effective_to: string;
  is_current: boolean;
  document_path: string;
  notes: string;
}

export interface PerDiemPolicyRequest {
  version: string;
  name: string;
  effective_from: string;
  effective_to: string;
  is_current: boolean;
  document: File;
  notes: string;
}

export interface getPerDiemPolicyProps {
  params?: Record<string, any>;
}
