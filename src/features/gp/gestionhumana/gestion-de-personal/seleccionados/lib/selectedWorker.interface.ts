import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface SelectedWorkerResponse {
  data: SelectedWorkerResource[];
  links: Links;
  meta: Meta;
}

export interface SelectedWorkerResource {
  id: number;
  nombre_completo: string;
  vat: string;
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
  estado_trabajador: string;
  jefe_id?: number | null;
  jefe?: string | null;
  supervisor_id?: number | null;
  supervisor?: string | null;
  motivo_status?: string | null;
  fecha_inicio?: string | null;
  presupuesto?: string | number | null;
  sueldo?: string | number | null;
  carta_oferta?: string | null;
  status_carta_oferta_id?: number | null;
  carta_oferta_firmada: boolean;
  status_envio_mail_carta_oferta?: number | null;
  fecha_envio_mail_carta_oferta?: string | null;
  status_id?: number | null;
  estado_altabaja?: string | null;
  has_user?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface getSelectedWorkersProps {
  params?: Record<string, any>;
}
