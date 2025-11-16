import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface FuelTypeResponse {
  data: FuelTypeResource[];
  links: Links;
  meta: Meta;
}

export interface FuelTypeResource {
  id: number;
  code: string;
  description: string;
  electric_motor: boolean;
  status: boolean;
}

export interface FuelTypeRequest {
  code: string;
  description: string;
  electric_motor: boolean;
  status: boolean;
}

export interface getFuelTypeProps {
  params?: Record<string, any>;
}
