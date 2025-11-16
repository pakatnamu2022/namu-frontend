import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface EngineTypesResponse {
  data: EngineTypesResource[];
  links: Links;
  meta: Meta;
}

export interface EngineTypesResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface EngineTypesRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getEngineTypesProps {
  params?: Record<string, any>;
}
