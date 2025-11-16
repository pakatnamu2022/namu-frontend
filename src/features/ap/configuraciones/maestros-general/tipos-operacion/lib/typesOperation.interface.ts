import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface TypesOperationResponse {
  data: TypesOperationResource[];
  links: Links;
  meta: Meta;
}

export interface TypesOperationResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface TypesOperationRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getTypesOperationProps {
  params?: Record<string, any>;
}
