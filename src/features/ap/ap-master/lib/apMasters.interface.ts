import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ApMastersResponse {
  data: ApMastersResource[];
  links: Links;
  meta: Meta;
}

export interface ApMastersResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status?: boolean;
}

export interface ApMastersRequest {
  code: string;
  description: string;
  type: string;
  status?: boolean;
}

export interface getApMastersProps {
  params?: Record<string, any>;
}
