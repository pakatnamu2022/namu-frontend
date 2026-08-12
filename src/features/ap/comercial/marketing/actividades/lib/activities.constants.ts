import { type ModelComplete, type Option } from "@/core/core.interface";
import { ActivitiesResource } from "./activities.interface";

const ROUTE = "actividades";
const ABSOLUTE_ROUTE = `/ap/comercial/marketing/${ROUTE}`;

export const ACTIVITIES: ModelComplete<ActivitiesResource> = {
  MODEL: {
    name: "Actividad",
    plural: "Actividades",
    gender: true,
  },
  ICON: "CalendarCheck2",
  ENDPOINT: "/marketing/activities",
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
