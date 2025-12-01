import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface BrandsResponse {
  data: BrandsResource[];
  links: Links;
  meta: Meta;
}

export interface BrandsResource {
  id: number;
  code: string;
  dyn_code: string;
  name: string;
  description: string;
  logo_url: string;
  logo_min_url: string;
  group_id: number;
  type_operation_id: number;
  status: boolean;
}

export interface BrandsRequest {
  code?: string;
  dyn_code?: string;
  name?: string;
  description?: string;
  logo?: File;
  logo_min?: File;
  group_id?: string;
  type_operation_id?: number;
  status?: boolean;
}

export interface getBrandsProps {
  params?: Record<string, any>;
}
