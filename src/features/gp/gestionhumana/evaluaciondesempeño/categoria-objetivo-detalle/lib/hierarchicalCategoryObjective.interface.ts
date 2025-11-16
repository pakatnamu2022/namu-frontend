import { Links, Meta } from "@/src/shared/lib/pagination.interface";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";

export interface HierarchicalCategoryObjectiveResponse {
  data: HierarchicalCategoryObjectiveResource[];
  links: Links;
  meta: Meta;
}

export interface HierarchicalCategoryObjectiveResource {
  id: number;
  goal: number;
  weight: number;
  active: boolean;
  objective_id: number;
  category_id: number;
  objective: string;
  category: string;
  worker: string;
}

export interface getHierarchicalCategoryObjectivesProps {
  params?: Record<string, any>;
}

export interface CategoryObjectivePersonResponse {
  worker: WorkerResource;
  objectives: HierarchicalCategoryObjectiveResource[];
}
