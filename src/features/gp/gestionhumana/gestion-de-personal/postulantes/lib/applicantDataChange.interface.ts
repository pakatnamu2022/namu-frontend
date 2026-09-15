import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ApplicantDataChangeResponse {
  data: ApplicantDataChangeResource[];
  links: Links;
  meta: Meta;
}

export interface ApplicantDataChangeResource {
  id: number;
  empleado_id: number;
  applicant?: {
    id: number;
    nombre_completo: string;
    vat: string;
  } | null;
  nombre_completo?: string | null;
  vat?: string | null;
  vat2?: string | null;
  vat3?: string | null;
  fecha_nacimiento?: string | null;
  nacionalidad?: string | null;
  email?: string | null;
  cel_personal?: string | null;
  cel_referencia?: string | null;
  direccion_principal?: string | null;
  distrito?: string | null;
  provincia?: string | null;
  departamento?: string | null;
  estado_civil?: string | null;
  escolaridad?: string | null;
  sexo?: string | null;
  cv_actualizado?: string | null;
  foto_adjunto?: string | null;
  status_id: number;
  obs_rechazado?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface getApplicantDataChangesProps {
  params?: Record<string, any>;
}
