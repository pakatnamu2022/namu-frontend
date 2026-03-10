import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ApprovedAccesoriesResponse {
  data: ApprovedAccesoriesResource[];
  links: Links;
  meta: Meta;
}

export interface ApprovedAccesoriesResource {
  id: number;
  code: string;
  type_operation_id: number;
  type_operation: string;
  description: string;
  price: number;
  status: boolean;
  body_type_id: string;
  currency_symbol?: string;
}

export interface ApprovedAccesoriesRequest {
  code: string;
  type_operation_id: number;
  description: string;
  price: number;
  status: boolean;
  body_type_id: string;
}

export interface getApprovedAccesoriesProps {
  params?: Record<string, any>;
}
