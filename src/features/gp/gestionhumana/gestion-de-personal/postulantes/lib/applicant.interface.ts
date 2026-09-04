import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ApplicantResponse {
  data: ApplicantResource[];
  links: Links;
  meta: Meta;
}

export interface ApplicantResource {
  id: number;
  nombre_completo: string;
  vat: string;
  vat2?: string | null;
  vat3?: string | null;
  sexo?: string | null;
  fecha_nacimiento?: string | null;
  estado_civil?: string | null;
  nacionalidad?: string | null;
  lugar_nacimiento?: string | null;
  email?: string | null;
  cel_personal?: string | null;
  cel_refencia?: string | null;
  tel_referencia_2?: string | null;
  direccion_principal?: string | null;
  direccion_ref?: string | null;
  distrito?: string | null;
  provincia?: string | null;
  departamento?: string | null;
  brevete_matpel?: string | null;
  clase_brev?: string | null;
  categoria_brev?: string | null;
  estudios_id?: number | null;
  escolaridad?: string | number | null;
  estado_estudios_prim?: string | null;
  centro_estudios_prim?: string | null;
  estado_estudios_sec?: string | null;
  centro_estudios_sec?: string | null;
  institucion_tec_univ?: string | null;
  carrera_tec_univ?: string | null;
  ciudad_dep_est_tec_univ?: string | null;
  nivel_alcanzado?: string | null;
  ciclo_estudios?: string | null;
  anos_curso?: string | null;
  grado_obtenido?: string | null;
  cv_actualizado?: string | null;
  foto_adjunto?: string | null;
  sede_id: number;
  sede?: string;
  area_id: number;
  area?: string;
  cargo_id: number;
  cargo?: string;
  centro_costo_id?: number | null;
  proceso_postulacion_id: number;
  proceso?: string;
  tipo_trabajador_id: number;
  estado_postulante: string;
  jefe_id?: number | null;
  motivo_status?: string | null;
  has_user?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface getApplicantsProps {
  params?: Record<string, any>;
}
