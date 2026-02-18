import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { TYPE_EVALUATION_VALUES } from "../../evaluaciones/lib/evaluation.constans";

export interface getCyclesProps {
  params?: Record<string, any>;
}
export interface CycleResponse {
  data: CycleResource[];
  links: Links;
  meta: Meta;
}

export interface CycleResource {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  cut_off_date: string;
  // start_date_objectives: string;
  // end_date_objectives: string;
  period_id: number;
  parameter_id: number;
  status: string;
  typeEvaluation: TYPE_EVALUATION_VALUES;
  typeEvaluationName: string;
  period: Period;
  parameter: Parameter;
  categories: Category[];
}

export interface Category {
  hierarchical_category_id: number;
  hierarchical_category: string;
}

export interface Parameter {
  id: number;
  name: string;
  type: string;
  isPercentage: boolean;
  details: Detail[];
}

export interface Detail {
  id: number;
  label: string;
  from: string;
  to: string;
  parameter_id: number;
}

export interface Period {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

export interface getCyclesProps {
  params?: Record<string, any>;
}

export interface WeightsPreviewObjective {
  id: number;
  objective: string;
  weight: string;
  fixedWeight: boolean;
}

export interface WeightsPreviewPerson {
  person_id: number;
  person: string;
  category_id: number;
  category: string;
  total_weight: number;
  objectives: WeightsPreviewObjective[];
}

export interface WeightsPreviewResponse {
  cycle_id: number;
  needs_update_count: number;
  needs_update: WeightsPreviewPerson[];
}
