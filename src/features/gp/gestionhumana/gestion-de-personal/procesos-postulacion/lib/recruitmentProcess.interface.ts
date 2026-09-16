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
  solicitante_id?: number | null;
  solicitante?: string;
  prioridad?: number | null;
  fecha_inicio: string;
  fecha_fin_plazo?: string;
  fecha_fin_cierre?: string;
  dias_plazo?: number;
  pausado?: boolean;
  motivo_pausa?: string | null;
  fecha_inicio_pausa?: string | null;
  dias_pausados?: number;
  veces_pausado?: number;
  status_id: number;
  status?: RecruitmentProcessStatus;
  is_open: boolean;
  applicants_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RecruitmentProcessHistoryEntry {
  id: number;
  accion: string;
  detalle?: string | null;
  dias_agregados?: number | null;
  usuario?: string;
  created_at: Date;
}

export interface RecruitmentProcessCoverage {
  dias_plazo: number;
  dias_transcurridos: number;
  dias_pausados: number;
  dias_gestion: number;
  dentro_de_plazo: boolean;
  pausado: boolean;
}

export interface getRecruitmentProcessesProps {
  params?: Record<string, any>;
}
