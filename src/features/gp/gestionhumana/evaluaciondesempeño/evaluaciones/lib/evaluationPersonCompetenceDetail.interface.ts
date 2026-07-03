import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface EvaluationPersonCompetenceDetailResource {
  id: number;
  evaluation_id: number;
  evaluator_id: number;
  person_id: number;
  competence_id: number;
  sub_competence_id: number;
  person: string;
  evaluator: string;
  competence: string;
  sub_competence: string;
  evaluatorType: number;
  result: string;
}

export interface DestroyManyPersonCompetenceDetailResponse {
  success?: boolean;
  message?: string;
  deleted_category_assignments?: number;
}

export interface EvaluationPersonCompetenceDetailGroupedResponse {
  data: EvaluationPersonCompetenceDetailGroup[];
  links: Links;
  meta: Meta;
}

export interface EvaluationPersonCompetenceDetailGroup {
  person_id: number;
  person: string;
  competence_id: number;
  competence: string;
  subcompetences: EvaluationPersonCompetenceDetailSubcompetence[];
}

export interface EvaluationPersonCompetenceDetailSubcompetence {
  id: number;
  sub_competence_id: number;
  sub_competence: string;
  evaluator_id: number;
  evaluator: string;
  evaluatorType: number;
  result: string;
}
