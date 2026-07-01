import { type ModelComplete } from "@/core/core.interface";
import { AttendanceCodeMappingResource } from "./attendance-code-mapping.interface";

const ROUTE = "mapeo-codigos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/asistencias/${ROUTE}`;

export const ATTENDANCE_CODE_MAPPING: ModelComplete<AttendanceCodeMappingResource> =
  {
    MODEL: {
      name: "Mapeo de Código de Asistencia",
      plural: "Mapeos de Código de Asistencia",
      gender: false,
    },
    ICON: "Link2",
    ENDPOINT: "/gp/gh/attendance/code-mappings",
    QUERY_KEY: "attendance-code-mappings",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  };
