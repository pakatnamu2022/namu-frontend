import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ReasonsAdjustmentResponse {
  data: ReasonsAdjustmentResource[];
  links: Links;
  meta: Meta;
}

export interface ReasonsAdjustmentResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface ReasonsAdjustmentRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getReasonsAdjustmentProps {
  params?: Record<string, any>;
}
