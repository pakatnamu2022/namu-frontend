import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface EvaluationModelResponse {
  data: EvaluationModelResource[];
  links: Links;
  meta: Meta;
}

export interface EvaluationModelResource {
  id: number;
  categories: string;
  leadership_weight: string;
  self_weight: string;
  par_weight: string;
  report_weight: string;
  category_details: CategoryDetail[];
}

export interface CategoryDetail {
  id: number;
  name: string;
  description: string;
  excluded_from_evaluation: boolean;
  hasObjectives: boolean;
}

export interface EvaluationModelRequest {
  leadership_weight: number;
  self_weight: number;
  par_weight: number;
  report_weight: number;
  categories: number[];
}

export interface getEvaluationModelsProps {
  params?: Record<string, any>;
}
