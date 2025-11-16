import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface MaritalStatusResponse {
  data: MaritalStatusResource[];
  links: Links;
  meta: Meta;
}

export interface MaritalStatusResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface MaritalStatusRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getMaritalStatusProps {
  params?: Record<string, any>;
}
