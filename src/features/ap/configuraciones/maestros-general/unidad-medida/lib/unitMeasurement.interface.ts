import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface UnitMeasurementResponse {
  data: UnitMeasurementResource[];
  links: Links;
  meta: Meta;
}

export interface UnitMeasurementResource {
  id: number;
  dyn_code: string;
  nubefac_code: string;
  description: string;
  status: boolean;
}

export interface UnitMeasurementRequest {
  dyn_code: string;
  nubefac_code: string;
  description: string;
  status: boolean;
}

export interface getUnitMeasurementProps {
  params?: Record<string, any>;
}
