import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { DistrictResource } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.interface";

export interface AccountantDistrictAssignmentResponse {
  data: AccountantDistrictAssignmentResource[];
  links: Links;
  meta: Meta;
}

export interface AccountantDistrictAssignmentResource {
  id: number;
  worker: WorkerResource;
  district: DistrictResource;
  created_at: string;
  updated_at: string;
}

export interface AccountantDistrictAssignmentRequest {
  worker_id: string;
  district_id: string;
}

export interface getAccountantDistrictAssignmentProps {
  params?: Record<string, any>;
}
