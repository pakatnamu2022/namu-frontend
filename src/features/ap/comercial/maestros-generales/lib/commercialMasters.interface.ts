import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface CommercialMastersResponse {
  data: CommercialMastersResource[];
  links: Links;
  meta: Meta;
}

export interface CommercialMastersResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status?: boolean;
}

export interface CommercialMastersRequest {
  code: string;
  description: string;
  type: string;
  status?: boolean;
}

export interface getCommercialMastersProps {
  params?: Record<string, any>;
}
