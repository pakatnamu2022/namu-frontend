import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";

export interface EvaluationPersonDetailResponse {
  data: EvaluationPersonDetailResource[];
  links: Links;
  meta: Meta;
}

export interface EvaluationPersonDetailResource {
  id: number;
  person: WorkerResource;
}

export interface getEvaluationPersonDetailsProps {
  params?: Record<string, any>;
}
