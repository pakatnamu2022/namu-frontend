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

export interface CompetencesSyncPreviewPersonToRemove {
  id: number;
  competence: string;
  sub_competence: string;
  evaluatorType: number;
  result: string;
  tiene_respuesta: boolean;
}

export interface CompetencesSyncPreviewPersonToAdd {
  competence: string;
  sub_competence: string;
  evaluatorType: number;
  evaluator_id: number;
}

export interface CompetencesSyncPreviewPersona {
  person_id: number;
  name: string;
  a_eliminar: CompetencesSyncPreviewPersonToRemove[];
  a_agregar: CompetencesSyncPreviewPersonToAdd[];
}

export interface CompetencesSyncPreviewResponse {
  evaluation_id: number;
  evaluation_name: string;
  total_a_eliminar: number;
  total_sin_respuesta_a_eliminar: number;
  total_con_respuesta_a_eliminar: number;
  total_a_agregar: number;
  personas: CompetencesSyncPreviewPersona[];
}

export interface CompetencesSyncResultPersona {
  person_id: number;
  name: string;
  eliminados: number;
  eliminados_sin_respuesta: number;
  eliminados_con_respuesta: number;
  agregados: number;
}

export interface CompetencesSyncResponse {
  evaluation_id: number;
  personas_procesadas: number;
  registros_eliminados: number;
  registros_sin_respuesta_eliminados: number;
  registros_con_respuesta_eliminados: number;
  registros_agregados: number;
  personas: CompetencesSyncResultPersona[];
}
