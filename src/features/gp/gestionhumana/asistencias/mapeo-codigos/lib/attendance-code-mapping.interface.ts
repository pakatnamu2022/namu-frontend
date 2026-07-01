import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface AttendanceCodeMappingResponse {
  data: AttendanceCodeMappingResource[];
  links?: Links;
  meta: Meta;
}

export interface AttendanceCodeMappingResource {
  id: number;
  emp_code: string;
  vat: string;
  note: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}
