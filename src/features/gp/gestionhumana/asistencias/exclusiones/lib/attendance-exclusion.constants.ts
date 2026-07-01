import { type ModelComplete } from "@/core/core.interface";
import { AttendanceExclusionResource } from "./attendance-exclusion.interface";

const ROUTE = "exclusiones";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/asistencias/${ROUTE}`;

export const ATTENDANCE_EXCLUSION: ModelComplete<AttendanceExclusionResource> = {
  MODEL: {
    name: "Excluido de Asistencia",
    plural: "Excluidos de Asistencia",
    gender: false,
  },
  ICON: "UserX",
  ENDPOINT: "/admin/attendance-exclusions",
  QUERY_KEY: "attendance-exclusions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
