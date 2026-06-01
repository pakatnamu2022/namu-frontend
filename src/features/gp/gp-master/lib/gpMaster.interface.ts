import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface GpMastersResponse {
  data: GpMastersResource[];
  links: Links;
  meta: Meta;
}

export interface GpMastersResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status?: boolean;
}

export interface GpMastersRequest {
  code: string;
  description: string;
  type: string;
  status?: boolean;
}

export interface getGpMastersProps {
  params?: Record<string, any>;
}
