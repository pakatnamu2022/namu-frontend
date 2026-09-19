import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { WorkScheduleResource } from "../../../asistencias/horarios/lib/work-schedule.interface";

export interface WorkerResponse {
  data: WorkerResource[];
  links: Links;
  meta: Meta;
}

export interface WorkerResource {
  id: number;
  supervisor_id?: number;
  name: string;
  document: string;
  sede: string;
  position: string;
  offerLetterConfirmationId: number;
  emailOfferLetterStatusId: number;
  offerLetterConfirmation: string;
  emailOfferLetterStatus: string;
  photo: string;
  inclusion_reason?: string;
  has_category?: boolean;
  has_objectives?: boolean;
  has_competences?: boolean;
  has_signature: boolean;
  /**
   * SHOW EXTRA = 1 => Show extra data (inclusion_reason, has_category, has_objectives, has_competences)
   */
  workSchedule?: WorkScheduleResource;
}

export interface getWorkersProps {
  params?: Record<string, any>;
}

export interface getWorkerProps {
  showExtra: 1 | 0;
}

export interface PersonBirthdayResponse {
  data: PersonBirthdayResource[];
  links: Links;
  meta: Meta;
}

export interface PersonBirthdayResource {
  id: number;
  nombre_completo: string;
  photo: string;
  position: string;
  days_to_birthday: number;
  fecha_nacimiento: string;
}

export interface WorkerContractSummary {
  id: number;
  tipo_contrato: string | null;
  cargo: string | null;
  sede: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  sueldo: number;
  es_adenda: boolean;
}

export interface WorkerSalaryIncreaseSummary {
  id: number;
  fecha: string;
  sueldo_anterior: number;
  sueldo_nuevo: number;
  motivo: string | null;
}

export interface WorkerSalaryPoint {
  date: string;
  salary: number;
  source: "CONTRATO" | "AUMENTO" | "ACTUAL";
  detail: string | null;
}

export interface WorkerContractsSummary {
  worker_id: number;
  current_salary: number | null;
  /** true si el último contrato es INDETERMINADO (único caso en que se registran aumentos). */
  can_register_increase: boolean;
  contracts: WorkerContractSummary[];
  increases: WorkerSalaryIncreaseSummary[];
  salary_history: WorkerSalaryPoint[];
}

export interface WorkerVacationResource {
  id: number;
  empleado_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: number;
  tipo_nombre?: string | null;
  periodo_inicio: string | null;
  periodo_fin: string | null;
  observacion: string | null;
  status_id: number;
  status?: string | null;
  aprobacion_jefatura: number | boolean | null;
  aprobacion_rrhh: number | boolean | null;
  sede?: string | null;
}
