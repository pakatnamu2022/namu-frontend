import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface VehicleStatusResponse {
  data: VehicleStatusResource[];
  links: Links;
  meta: Meta;
}

export interface VehicleStatusResource {
  id: number;
  code: string;
  description: string;
  use: string;
  color: string;
  status: boolean;
}

export interface VehicleStatusRequest {
  code: string;
  description: string;
  use: string;
  color: string;
  status: boolean;
}

export interface getVehicleStatusProps {
  params?: Record<string, any>;
}
