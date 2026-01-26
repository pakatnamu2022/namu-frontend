import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface WorkTypeResponse {
  data: WorkTypeResource[];
  links: Links;
  meta: Meta;
}

export interface WorkTypeResource {
  id: number;
  code: string;
  name: string;
  description: string;
  multiplier: number;
  base_hours: number;
  is_extra_hours: boolean;
  is_night_shift: boolean;
  is_holiday: boolean;
  is_sunday: boolean;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkTypeRequest {
  code: string;
  name: string;
  description: string;
  multiplier: number;
  base_hours: number;
  is_extra_hours: boolean;
  is_night_shift: boolean;
  is_holiday: boolean;
  is_sunday: boolean;
  active: boolean;
  order: number;
}

export interface getWorkTypesProps {
  params?: Record<string, any>;
}
