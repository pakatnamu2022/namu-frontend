import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface VehicleTypeResponse {
  data: VehicleTypeResource[];
  links: Links;
  meta: Meta;
}

export interface VehicleTypeResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface VehicleTypeRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getVehicleTypeProps {
  params?: Record<string, any>;
}
