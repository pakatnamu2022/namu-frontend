import { Links, Meta } from "@/src/shared/lib/pagination.interface";
import { ObjectiveResource } from "../../objetivos/lib/objective.interface";
import { CompetenceResource } from "../../competencias/lib/competence.interface";

export interface HierarchicalCategoryResponse {
  data: HierarchicalCategoryResource[];
  links: Links;
  meta: Meta;
}

export interface HierarchicalCategoryResource {
  id: number;
  name: string;
  description: string;
  pass: boolean;
  issues: string[];
  objectives: ObjectiveResource[];
  competences: CompetenceResource[];
  excluded_from_evaluation: boolean;
  hasObjectives: boolean;
  children: HierarchicalCategoryDetail[];
}

export interface HierarchicalCategoryDetail {
  id: number;
  position: string;
  area: string;
  leadership: string;
  hierarchical_category_id: number;
  position_id: number;
}

export interface getHierarchicalCategorysProps {
  params?: Record<string, any>;
}
