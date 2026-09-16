import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface InterviewResponse {
  data: InterviewResource[];
  links: Links;
  meta: Meta;
}

export interface InterviewScore {
  id: number;
  sub_competencia_id: number;
  sub_competencia?: string;
  competencia?: string;
  puntaje?: number | null;
}

export interface InterviewResource {
  id: number;
  proceso_postulacion_id: number;
  proceso?: string;
  persona_id: number;
  postulante?: string;
  fase: number;
  fase_label?: string;
  entrevistador_id?: number | null;
  entrevistador?: string;
  fecha_entrevista?: string | null;
  resultado_promedio?: number | null;
  observaciones?: string | null;
  scores: InterviewScore[];
  created_at?: string;
  updated_at?: string;
}

export interface ProcessCompetence {
  id: number;
  sub_competencia_id: number;
  nombre?: string;
  competencia?: string;
  orden?: number;
}

export interface getInterviewsProps {
  params?: Record<string, any>;
}
