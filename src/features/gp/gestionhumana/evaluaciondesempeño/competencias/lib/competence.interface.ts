import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface CompetenceResponse {
  data: CompetenceResource[];
  links: Links;
  meta: Meta;
}

export interface CompetenceResource {
  id: number;
  nombre: string;
  subcompetences: Subcompetence[];
}

export interface Subcompetence {
  id: number;
  competencia_id: number;
  nombre: string;
  definicion: string;
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
  level5?: string;
}

export interface getCompetencesProps {
  params?: Record<string, any>;
}
