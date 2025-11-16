import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface VehicleCategoryResponse {
  data: VehicleCategoryResource[];
  links: Links;
  meta: Meta;
}

export interface VehicleCategoryResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface VehicleCategoryRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getVehicleCategoryProps {
  params?: Record<string, any>;
}
