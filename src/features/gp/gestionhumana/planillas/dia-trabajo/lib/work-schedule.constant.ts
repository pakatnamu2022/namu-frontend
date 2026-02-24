import { type ModelComplete } from "@/core/core.interface";
import { WorkScheduleResource, WorkScheduleStatus } from "./work-schedule.interface";

const ROUTE = "dia-trabajo";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const WORK_SCHEDULE: ModelComplete<WorkScheduleResource> = {
  MODEL: {
    name: "Día de Trabajo",
    plural: "Días de Trabajo",
    gender: false,
  },
  ICON: "CalendarDays",
  ENDPOINT: "/gp/gh/payroll/schedules",
  QUERY_KEY: "work-schedules",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    worker_id: 0,
    code: "",
    period_id: 0,
    work_date: "",
    status: "SCHEDULED",
    notes: null,
    created_at: "",
    updated_at: "",
  },
};

export const WORK_SCHEDULE_STATUS_OPTIONS: {
  value: WorkScheduleStatus;
  label: string;
  color: string;
}[] = [
  { value: "SCHEDULED", label: "Programado", color: "bg-blue-100 text-blue-800" },
  { value: "WORKED", label: "Trabajado", color: "bg-green-100 text-green-800" },
  { value: "ABSENT", label: "Ausente", color: "bg-red-100 text-red-800" },
  { value: "VACATION", label: "Vacaciones", color: "bg-yellow-100 text-yellow-800" },
  { value: "SICK_LEAVE", label: "Permiso Médico", color: "bg-orange-100 text-orange-800" },
  { value: "PERMISSION", label: "Permiso", color: "bg-purple-100 text-purple-800" },
];

export const getStatusOption = (status: WorkScheduleStatus) => {
  return WORK_SCHEDULE_STATUS_OPTIONS.find((opt) => opt.value === status);
};
