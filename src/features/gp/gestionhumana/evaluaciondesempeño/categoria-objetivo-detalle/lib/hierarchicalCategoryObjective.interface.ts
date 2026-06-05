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

export interface GlobalWeightReportItem {
  category_id: number;
  category_name: string;
  total_workers: number;
  valid_workers: number;
  invalid_workers: number;
  is_valid: boolean;
}

export interface CategoryReferenceObjective {
  objective_id: number;
  objective_name: string;
  goal_reference: number;
  weight: number;
  fixed_weight: boolean;
}

export interface CategoryWeightReportObjective {
  objective_id: number;
  objective_name: string;
  weight: number;
  valid: boolean;
}

export interface CategoryWeightReportWorker {
  person_id: number;
  name: string;
  valid: boolean;
  total_weight: number;
  objectives: CategoryWeightReportObjective[];
  issues: string[];
}

export interface CategoryWeightReport {
  category_id: number;
  category_name: string;
  total_workers: number;
  valid_workers: number;
  invalid_workers: number;
  is_valid: boolean;
  objectives: CategoryReferenceObjective[];
  workers: CategoryWeightReportWorker[];
}

export interface ApplyReferenceWeightsObjective {
  objective_id: number;
  weight: number;
  goal: number;
  active?: boolean;
}

export interface ApplyReferenceWeightsPayload {
  objectives: ApplyReferenceWeightsObjective[];
}
