import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface FamiliesResponse {
  data: FamiliesResource[];
  links: Links;
  meta: Meta;
}

export interface FamiliesResource {
  id: number;
  code: string;
  description: string;
  brand_id: number;
  brand: string;
  status: boolean;
}

export interface FamiliesRequest {
  description: string;
  status: boolean;
}

export interface getFamiliesProps {
  params?: Record<string, any>;
}
