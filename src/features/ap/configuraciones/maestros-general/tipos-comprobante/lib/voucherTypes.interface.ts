import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface VoucherTypesResponse {
  data: VoucherTypesResource[];
  links: Links;
  meta: Meta;
}

export interface VoucherTypesResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface VoucherTypesRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getVoucherTypesProps {
  params?: Record<string, any>;
}
