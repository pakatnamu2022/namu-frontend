import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface PerDiemCategoryResponse {
  data: PerDiemCategoryResource[];
  links: Links;
  meta: Meta;
}

export interface PerDiemCategoryResource {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface PerDiemCategoryRequest {
  name: string;
  description: string;
}

export interface getPerDiemCategoryProps {
  params?: Record<string, any>;
}
