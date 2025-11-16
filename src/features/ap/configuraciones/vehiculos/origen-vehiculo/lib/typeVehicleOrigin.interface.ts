import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface TypeVehicleOriginResponse {
  data: TypeVehicleOriginResource[];
  links: Links;
  meta: Meta;
}

export interface TypeVehicleOriginResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface TypeVehicleOriginRequest {
  code: string;
  description: string;
  type: string;
  status?: boolean;
}

export interface getTypeVehicleOriginProps {
  params?: Record<string, any>;
}
