import { type ModelComplete } from "@/core/core.interface";
import { AgendaResource } from "./agenda.interface";

const ROUTE = "agenda";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const AGENDA: ModelComplete<AgendaResource> = {
  MODEL: {
    name: "Cita de Agenda",
    plural: "Agenda Comercial",
    gender: false,
  },
  ICON: "Calendar",
  ENDPOINT: "/ap/commercial/agenda",
  QUERY_KEY: "agenda",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
  EMPTY: {
    id: 0,
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    cliente_id: 0,
    cliente_nombre: "",
    cliente_telefono: "",
    cliente_email: "",
    tipo_cita: "consulta",
    estado: "programada",
    prioridad: "media",
    ubicacion: "",
    notas: "",
    recordatorio: 15,
    created_by: 0,
    created_at: "",
    updated_at: "",
  },
};

// Colores para tipos de cita
export const TIPO_CITA_COLORS = {
  consulta: "#10b981", // verde
  reunion: "#3b82f6", // azul
  presentacion: "#f59e0b", // amarillo
  seguimiento: "#8b5cf6", // púrpura
  cierre: "#ef4444", // rojo
} as const;

// Colores para estados
export const ESTADO_COLORS = {
  programada: "#6b7280", // gris
  en_progreso: "#f59e0b", // amarillo
  completada: "#10b981", // verde
  cancelada: "#ef4444", // rojo
} as const;

// Colores para prioridades
export const PRIORIDAD_COLORS = {
  baja: "#10b981", // verde
  media: "#f59e0b", // amarillo
  alta: "#ef4444", // rojo
} as const;
