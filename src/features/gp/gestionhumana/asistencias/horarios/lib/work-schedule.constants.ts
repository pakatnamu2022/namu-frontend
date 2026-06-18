import type { ModelComplete } from "@/core/core.interface";
import type { WorkScheduleResource } from "./work-schedule.interface";

const ROUTE = "horarios";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/asistencias/${ROUTE}`;

export const WORK_SCHEDULE: ModelComplete<WorkScheduleResource> = {
  MODEL: {
    name: "Horario",
    plural: "Horarios",
    gender: true,
  },
  ICON: "Clock",
  ENDPOINT: "/gp/gh/personal/work-schedule",
  QUERY_KEY: "work-schedule",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: "Domingo",
  2: "Lunes",
  3: "Martes",
  4: "Miércoles",
  5: "Jueves",
  6: "Viernes",
  7: "Sábado",
};

export const DAY_OF_WEEK_OPTIONS = [
  { value: "1", label: "Domingo" },
  { value: "2", label: "Lunes" },
  { value: "3", label: "Martes" },
  { value: "4", label: "Miércoles" },
  { value: "5", label: "Jueves" },
  { value: "6", label: "Viernes" },
  { value: "7", label: "Sábado" },
];
