import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface ProductCategoryResponse {
  data: ProductCategoryResource[];
  links: Links;
  meta: Meta;
}

export interface ProductCategoryResource {
  id: number;
  name: string;
  description: string;
  type_id: string;
  status: boolean;
}

export interface ProductCategoryRequest {
  code: string;
  description: string;
  type_id: string;
  status: boolean;
}

export interface getProductCategoryProps {
  params?: Record<string, any>;
}
