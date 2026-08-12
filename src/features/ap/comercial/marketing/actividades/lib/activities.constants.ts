import { type ModelComplete, type Option } from "@/core/core.interface";
import { ActivitiesResource } from "./activities.interface";

const ROUTE = "actividades";
const ABSOLUTE_ROUTE = `/ap/marketing/${ROUTE}`;

export const ACTIVITIES: ModelComplete<ActivitiesResource> = {
  MODEL: {
    name: "Actividad",
    plural: "Actividades",
    gender: true,
  },
  ICON: "CalendarCheck2",
  ENDPOINT: "/ap/marketing/activities",
  QUERY_KEY: "marketing-activities",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const ACTIVITY_STATUS_OPTIONS: Option[] = [
  { label: "Planeada", value: "planned" },
  { label: "En Progreso", value: "in_progress" },
  { label: "Ejecutada", value: "executed" },
  { label: "Cancelada", value: "cancelled" },
];

export const ACTIVITY_NEXT_STATUS: Record<string, { value: string; label: string } | undefined> = {
  planned: { value: "in_progress", label: "Iniciar" },
  in_progress: { value: "executed", label: "Marcar ejecutada" },
};

export const ACTIVITY_CANCELLABLE_STATUSES = ["planned", "in_progress"];
