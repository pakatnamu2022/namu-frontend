import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface GearShiftTypeResponse {
  data: GearShiftTypeResource[];
  links: Links;
  meta: Meta;
}

export interface GearShiftTypeResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface GearShiftTypeRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getGearShiftTypeProps {
  params?: Record<string, any>;
}
