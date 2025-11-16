import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface ProductTypeResponse {
  data: ProductTypeResource[];
  links: Links;
  meta: Meta;
}

export interface ProductTypeResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface ProductTypeRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getProductTypeProps {
  params?: Record<string, any>;
}
