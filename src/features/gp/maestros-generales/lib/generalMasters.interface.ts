import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface GeneralMastersResponse {
  data: GeneralMastersResource[];
  links: Links;
  meta: Meta;
}

export interface GeneralMastersResource {
  id: number;
  code: string;
  description: string;
  type: string;
  value?: string;
  effective_from?: string | null;
  effective_to?: string | null;
  status: number;
}

export interface GeneralMastersRequest {
  code: string;
  description: string;
  type: string;
  value?: string;
  effective_from?: string | null;
  effective_to?: string | null;
  status?: boolean;
}

export interface getGeneralMastersProps {
  params?: Record<string, any>;
}
