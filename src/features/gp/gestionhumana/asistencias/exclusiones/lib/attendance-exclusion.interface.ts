import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";

export interface AttendanceExclusionResponse {
  data: AttendanceExclusionResource[];
  links?: Links;
  meta: Meta;
}

export interface AttendanceExclusionResource {
  id: number;
  person_id: number;
  person: WorkerResource;
  reason: string | null;
  active: boolean;
  created_by: number;
  created_at: string;
}
