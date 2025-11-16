import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface ClientOriginResponse {
  data: ClientOriginResource[];
  links: Links;
  meta: Meta;
}

export interface ClientOriginResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface ClientOriginRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getClientOriginProps {
  params?: Record<string, any>;
}
