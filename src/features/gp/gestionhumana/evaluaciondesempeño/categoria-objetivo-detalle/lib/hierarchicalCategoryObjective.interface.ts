import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";

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
