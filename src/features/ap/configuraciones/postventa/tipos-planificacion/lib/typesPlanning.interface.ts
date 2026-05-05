import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface TypesPlanningResponse {
  data: TypesPlanningResource[];
  links: Links;
  meta: Meta;
}

export interface TypesPlanningResource {
  id: number;
  code: string;
  description: string;
  validate_receipt: boolean;
  validate_labor: boolean;
  type_document: string;
  status: boolean;
}

export interface TypesPlanningRequest {
  code: string;
  description: string;
  validate_receipt: boolean;
  validate_labor: boolean;
  type_document: string;
  status: boolean;
}

export interface getTypesPlanningProps {
  params?: Record<string, any>;
}
