import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface TypeClientResponse {
  data: TypeClientResource[];
  links: Links;
  meta: Meta;
}

export interface TypeClientResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface TypeClientRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getTypeClientProps {
  params?: Record<string, any>;
}
