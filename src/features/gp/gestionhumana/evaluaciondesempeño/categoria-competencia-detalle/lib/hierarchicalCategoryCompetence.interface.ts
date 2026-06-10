import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
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

export interface GlobalCompetenceReportItem {
  category_id: number;
  category_name: string;
  total_workers: number;
  valid_workers: number;
  invalid_workers: number;
  is_valid: boolean;
}

export interface CategoryReferenceCompetence {
  competence_id: number;
  competence_name: string;
}

export interface CategoryCompetenceReportWorker {
  person_id: number;
  name: string;
  valid: boolean;
  total_competences: number;
  assigned_competences: number;
  missing_competences: CategoryReferenceCompetence[];
  issues: string[];
}

export interface CategoryCompetenceReport {
  category_id: number;
  category_name: string;
  total_workers: number;
  valid_workers: number;
  invalid_workers: number;
  is_valid: boolean;
  competences: CategoryReferenceCompetence[];
  workers: CategoryCompetenceReportWorker[];
}
