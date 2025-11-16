import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface DepartmentResponse {
  data: DepartmentResource[];
  links: Links;
  meta: Meta;
}

export interface DepartmentResource {
  id: number;
  name: string;
}

export interface ProvinceResponse {
  data: ProvinceResource[];
  links: Links;
  meta: Meta;
}

export interface ProvinceResource {
  id: number;
  name: string;
  department_id: number;
}

export interface DistrictResponse {
  data: DistrictResource[];
  links: Links;
  meta: Meta;
}

export interface DistrictResource {
  id: number;
  name: string;
  province_id: number;
  department_id: number;
  ubigeo: string;
}

export interface getLocationProps {
  params?: Record<string, any>;
}
