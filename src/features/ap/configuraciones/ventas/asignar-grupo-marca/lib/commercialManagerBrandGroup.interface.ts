import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface CommercialManagerBrandGroupResponse {
  data: CommercialManagerBrandGroupResource[];
  links: Links;
  meta: Meta;
}

export interface CommercialManagerBrandGroupResource {
  year: number;
  month: number;
  brand_group_id: number;
  commercial_managers: AsesorResource[];
}

export interface CommercialManagerBrandGroupRequest {
  brand_group_id: number;
  commercial_managers: number[];
}

export interface AsesorResource {
  id: number;
  name: string;
}

export interface getCommercialManagerBrandGroupProps {
  params?: Record<string, any>;
}
