import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ReasonsRejectionResponse {
  data: ReasonsRejectionResource[];
  links: Links;
  meta: Meta;
}

export interface ReasonsRejectionResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface ReasonsRejectionRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getReasonsRejectionProps {
  params?: Record<string, any>;
}
