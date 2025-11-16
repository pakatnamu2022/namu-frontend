import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface TaxClassTypesResponse {
  data: TaxClassTypesResource[];
  links: Links;
  meta: Meta;
}

export interface TaxClassTypesResource {
  id: number;
  dyn_code: string;
  description: string;
  tax_class: string;
  type: string;
  status: boolean;
}

export interface TaxClassTypesRequest {
  dyn_code: string;
  description: string;
  tax_class: string;
  type: string;
  status: boolean;
}

export interface getTaxClassTypesProps {
  params?: Record<string, any>;
}
