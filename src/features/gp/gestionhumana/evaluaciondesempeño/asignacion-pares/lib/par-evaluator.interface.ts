import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";

export interface ParEvaluatorResponse {
  data: ParEvaluatorResource[];
  links: Links;
  meta: Meta;
}

export interface ParEvaluatorResource {
  id: number;
  worker_id: number;
  mate_id: number;
  worker: WorkerResource;
  mate: WorkerResource;
}

export interface getParEvaluatorsProps {
  params?: Record<string, any>;
}
