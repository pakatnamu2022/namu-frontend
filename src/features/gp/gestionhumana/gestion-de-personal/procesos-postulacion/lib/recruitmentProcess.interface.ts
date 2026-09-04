import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface RecruitmentProcessResponse {
  data: RecruitmentProcessResource[];
  links: Links;
  meta: Meta;
}

export interface RecruitmentProcessStatus {
  id: number;
  estado: string;
  color: string;
}

export interface RecruitmentProcessResource {
  id: number;
  nombre_postulacion: string;
  cant_trab_solicita: number;
  sede_id: number;
  sede?: string;
  area_id: number;
  area?: string;
  cargo_id: number;
  cargo?: string;
  centro_costo_id?: number;
  fecha_inicio: string;
  fecha_fin_plazo?: string;
  fecha_fin_cierre?: string;
  dias_plazo?: number;
  status_id: number;
  status?: RecruitmentProcessStatus;
  is_open: boolean;
  applicants_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface getRecruitmentProcessesProps {
  params?: Record<string, any>;
}
