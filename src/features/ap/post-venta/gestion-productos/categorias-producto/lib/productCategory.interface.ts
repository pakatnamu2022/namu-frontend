import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ProductCategoryResponse {
  data: ProductCategoryResource[];
  links: Links;
  meta: Meta;
}

export interface ProductCategoryResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface ProductCategoryRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getProductCategoryProps {
  params?: Record<string, any>;
}
