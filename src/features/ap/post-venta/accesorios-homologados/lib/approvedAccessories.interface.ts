import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ApprovedAccesoriesResponse {
  data: ApprovedAccesoriesResource[];
  links: Links;
  meta: Meta;
}

export interface ApprovedAccesoriesResource {
  id: number;
  code: string;
  type: string;
  description: string;
  price: number;
  status: boolean;
  type_currency_id: string;
  body_type_id: string;
  currency_symbol?: string;
}

export interface ApprovedAccesoriesRequest {
  code: string;
  type: string;
  description: string;
  price: number;
  status: boolean;
  type_currency_id: string;
  body_type_id: string;
}

export interface getApprovedAccesoriesProps {
  params?: Record<string, any>;
}
