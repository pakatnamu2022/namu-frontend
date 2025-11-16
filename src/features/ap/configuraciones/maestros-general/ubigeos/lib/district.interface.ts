import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface DistrictResponse {
  data: DistrictResource[];
  links: Links;
  meta: Meta;
}

export interface DistrictResource {
  id: number;
  name: string;
  ubigeo: string;
  province_id: number;
  province?: string;
  department_id: number;
  department?: string;
}

export interface DistrictRequest {
  name: string;
  ubigeo: string;
  province_id: number;
}

export interface getDistrictProps {
  params?: Record<string, any>;
}
