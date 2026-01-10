import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ReasonDiscardingSparePartResponse {
  data: ReasonDiscardingSparePartResource[];
  links: Links;
  meta: Meta;
}

export interface ReasonDiscardingSparePartResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface ReasonDiscardingSparePartRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getReasonDiscardingSparePartProps {
  params?: Record<string, any>;
}
