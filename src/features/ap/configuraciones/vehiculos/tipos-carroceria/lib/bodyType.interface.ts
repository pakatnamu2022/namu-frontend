import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface BodyTypeResponse {
  data: BodyTypeResource[];
  links: Links;
  meta: Meta;
}

export interface BodyTypeResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface BodyTypeRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getBodyTypeProps {
  params?: Record<string, any>;
}
