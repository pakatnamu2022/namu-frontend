import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type HourType = "DIURNO" | "NOCTURNO" | "REFRIGERIO";

export interface AttendanceRuleResponse {
  data: AttendanceRuleResource[];
  links: Links;
  meta: Meta;
}

export interface AttendanceRuleResource {
  id: number;
  code: string;
  hour_type: HourType;
  hours: number | null;
  multiplier: number;
  pay: boolean;
  use_shift: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRuleRequest {
  code: string;
  hour_type: HourType;
  hours: number | null;
  multiplier: number;
  pay: boolean;
  use_shift: boolean;
}
