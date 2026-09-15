import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ContractResponse {
  data: ContractResource[];
  links: Links;
  meta: Meta;
}

export interface ContractResource {
  id: number;
  empleado_id: number;
  trabajador?: string;
  tipo_contrato_id: number;
  tipo_contrato?: string;
  template_contrato_id: number;
  plantilla?: string;
  sede_id: number;
  sede?: string;
  cargo_id: number;
  cargo?: string;
  sueldo: number;
  fecha_inicio_actividades: string | null;
  fecha_inicio_contrato: string;
  fecha_fin_contrato: string | null;
  observacion: string | null;
  grupo_contrato: string | null;
  contrato_principal: number | null;
  convenio: string | null;
  lote: string | null;
  firmante_id: number | null;
  firmante?: string;
  firmante_sec_id: number | null;
  firmante_secundario?: string;
  solicitar_firma: boolean;
  fecha_solicitud: string | null;
  conformidad_rrhh: boolean;
  fecha_aprobacion_rrhh: string | null;
  confirmacion_firmante: boolean;
  fecha_confirmacion_firma: string | null;
  estado_envio_email: boolean;
  fecha_envio_email: string | null;
  conformidad_lectura: boolean;
  fecha_lectura: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface getContractsProps {
  params?: Record<string, any>;
}
