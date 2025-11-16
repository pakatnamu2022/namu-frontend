import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface PositionResponse {
  data: PositionResource[];
  links: Links;
  meta: Meta;
}

export interface PositionResource {
  id: number;
  name: string;
  descripcion?: string;
  area: string;
  jefatura: string;
  ntrabajadores: number;
  banda_salarial_min?: string;
  banda_salarial_media?: string;
  banda_salarial_max?: string;
  plazo_proceso_seleccion?: number;
  mof_adjunto: string;
  presupuesto?: string;
  tipo_onboarding_id?: number;
  area_id?: number;
  cargo_id?: number;
  hierarchical_category_id?: number;
}

export interface PositionCreateRequest {
  name: string;
  descripcion?: string;
  area_id?: number;
  hierarchical_category_id?: number;
  cargo_id?: number;
  ntrabajadores?: number;
  banda_salarial_min?: number;
  banda_salarial_media?: number;
  banda_salarial_max?: number;
  tipo_onboarding_id?: number;
  plazo_proceso_seleccion?: number;
  presupuesto?: number;
  mof_adjunto: File;
  files?: File[];
}

export interface getPositionsProps {
  params?: Record<string, any>;
}

export interface AreaResource {
  id: number;
  name: string;
  sede_id: number;
  sede: string;
}
