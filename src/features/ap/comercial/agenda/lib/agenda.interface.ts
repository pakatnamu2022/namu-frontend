import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface AgendaResponse {
  data: AgendaResource[];
  links: Links;
  meta: Meta;
}

export interface AgendaResource {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  cliente_id?: number;
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  tipo_cita: 'consulta' | 'reunion' | 'presentacion' | 'seguimiento' | 'cierre';
  estado: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta';
  ubicacion?: string;
  notas?: string;
  recordatorio?: number; // minutos antes
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface AgendaRequest {
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  cliente_id?: number;
  tipo_cita: 'consulta' | 'reunion' | 'presentacion' | 'seguimiento' | 'cierre';
  estado: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta';
  ubicacion?: string;
  notas?: string;
  recordatorio?: number;
}

export interface getAgendaProps {
  params?: Record<string, any>;
}

// Para el calendario
export interface AgendaCalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  client: string;
  type: 'consulta' | 'reunion' | 'presentacion' | 'seguimiento' | 'cierre';
  status: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
  priority: 'baja' | 'media' | 'alta';
  location?: string;
  notes?: string;
}