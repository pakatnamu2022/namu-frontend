import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface CategoryChecklistResponse {
  data: CategoryChecklistResource[];
  links: Links;
  meta: Meta;
}

export interface CategoryChecklistResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface CategoryChecklistRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getCategoryChecklistProps {
  params?: Record<string, any>;
}
