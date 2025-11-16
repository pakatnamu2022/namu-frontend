import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface TractionTypeResponse {
  data: TractionTypeResource[];
  links: Links;
  meta: Meta;
}

export interface TractionTypeResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface TractionTypeRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getTractionTypeProps {
  params?: Record<string, any>;
}
