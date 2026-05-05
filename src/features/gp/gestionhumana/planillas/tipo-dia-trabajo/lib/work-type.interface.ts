import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type ShiftType = "MORNING" | "NIGHT";
export type SegmentType = "WORK" | "BREAK";

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
  shift_type?: ShiftType;
  segments?: WorkTypeSegmentResource[];
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
  shift_type?: ShiftType;
}

export interface getWorkTypesProps {
  params?: Record<string, any>;
}

// Work Type Segments
export interface WorkTypeSegmentResource {
  id: number;
  work_type_id: number;
  segment_type: SegmentType;
  segment_order: number;
  duration_hours: number;
  multiplier: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface WorkTypeSegmentRequest {
  work_type_id: number;
  segment_type: SegmentType;
  segment_order: number;
  duration_hours: number;
  multiplier: number;
  description?: string;
}

export interface WorkTypeSegmentResponse {
  data: WorkTypeSegmentResource[];
}

// Client-side segment interface for UI
export interface WorkTypeSegment {
  id?: number;
  segment_type: SegmentType;
  segment_order: number;
  start_hour: number; // 0-24 (for calculations)
  end_hour: number; // 0-24 (for calculations)
  duration_hours: number;
  multiplier: number;
  description: string;
  tempId?: string; // For new segments not yet saved
}
