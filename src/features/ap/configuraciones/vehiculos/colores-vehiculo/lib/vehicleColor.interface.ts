import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface VehicleColorResponse {
  data: VehicleColorResource[];
  links: Links;
  meta: Meta;
}

export interface VehicleColorResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface VehicleColorRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getVehicleColorProps {
  params?: Record<string, any>;
}
