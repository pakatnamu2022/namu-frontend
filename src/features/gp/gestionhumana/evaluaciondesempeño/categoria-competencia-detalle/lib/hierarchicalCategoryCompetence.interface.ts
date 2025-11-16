import { Links, Meta } from "@/src/shared/lib/pagination.interface";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { CompetenceResource } from "../../competencias/lib/competence.interface";

export interface HierarchicalCategoryCompetenceResponse {
  data: HierarchicalCategoryCompetenceResource[];
  links: Links;
  meta: Meta;
}

export interface HierarchicalCategoryCompetenceResource {
  id: number;
  active: boolean;
  competence_id: number;
  category_id: number;
  competence: CompetenceResource;
  category: string;
  worker: string;
}

export interface getHierarchicalCategoryCompetencesProps {
  params?: Record<string, any>;
}

export interface CategoryCompetencePersonResponse {
  worker: WorkerResource;
  competences: HierarchicalCategoryCompetenceResource[];
}
