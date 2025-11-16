import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface TypesCategoryResponse {
  data: TypesCategoryResource[];
  links: Links;
  meta: Meta;
}

export interface TypesCategoryResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface TypesCategoryRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getTypesCategoryProps {
  params?: Record<string, any>;
}
