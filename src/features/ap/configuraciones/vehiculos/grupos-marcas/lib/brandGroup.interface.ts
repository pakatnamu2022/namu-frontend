import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface BrandGroupResponse {
  data: BrandGroupResource[];
  links: Links;
  meta: Meta;
}

export interface BrandGroupResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface BrandGroupRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getBrandGroupProps {
  params?: Record<string, any>;
}
