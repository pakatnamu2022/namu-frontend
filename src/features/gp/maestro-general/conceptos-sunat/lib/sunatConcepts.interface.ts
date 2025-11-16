import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface SunatConceptsResponse {
  data: SunatConceptsResource[];
  links: Links;
  meta: Meta;
}

export interface SunatConceptsResource {
  id: number;
  code_nubefact: string;
  description: string;
  type: string;
  prefix?: string;
  length: number;
  tribute_code: string;
  affects_total?: boolean;
  iso_code?: string;
  symbol?: string;
  percentage?: number;
  document_type?: number;
  currency_type?: number;
}

export interface SunatConceptsRequest {
  code_nubefact: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getSunatConceptsProps {
  params?: Record<string, any>;
}
