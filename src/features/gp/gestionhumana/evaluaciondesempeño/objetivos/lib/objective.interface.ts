import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ObjectiveResponse {
  data: ObjectiveResource[];
  links: Links;
  meta: Meta;
}

export interface ObjectiveResource {
  id: number;
  name: string;
  description?: string;
  goalReference: string;
  fixedWeight: number;
  isAscending: boolean;
  metric: string;
  metric_id: number;
}

export interface getObjectivesProps {
  params?: Record<string, any>;
}

export interface ActivateInCategoriesPreviewWeight {
  objective_id: number;
  active: boolean;
  weight: number;
  fixedWeight: boolean;
}

export interface ActivateInCategoriesPreviewWorker {
  worker_id: number;
  worker_name: string;
  current_weights: ActivateInCategoriesPreviewWeight[];
  projected_weights: ActivateInCategoriesPreviewWeight[];
}

export interface ActivateInCategoriesPreviewCategory {
  category_id: number;
  category_name: string;
  affected_workers_count: number;
  workers: ActivateInCategoriesPreviewWorker[];
}

export interface ActivateInCategoriesPreviewResponse {
  objective: { id: number; name: string };
  affected_categories_count: number;
  categories: ActivateInCategoriesPreviewCategory[];
}

export interface ActivateInCategoriesResponse {
  message: string;
  affected_categories: number;
  affected_workers: number;
}
