import { Links, Meta } from "@/src/shared/lib/pagination.interface";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";

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
