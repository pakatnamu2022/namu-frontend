import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ReasonDiscardingTallerResponse {
  data: ReasonDiscardingTallerResource[];
  links: Links;
  meta: Meta;
}

export interface ReasonDiscardingTallerResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface ReasonDiscardingTallerRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getReasonDiscardingTallerProps {
  params?: Record<string, any>;
}
