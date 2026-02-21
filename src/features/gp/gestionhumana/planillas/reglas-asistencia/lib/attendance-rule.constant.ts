import { type ModelComplete } from "@/core/core.interface";
import { AttendanceRuleResource } from "./attendance-rule.interface";

const ROUTE = "reglas-asistencia";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const ATTENDANCE_RULE: ModelComplete<AttendanceRuleResource> = {
  MODEL: {
    name: "Regla de Asistencia",
    plural: "Reglas de Asistencia",
    gender: true,
  },
  ICON: "ClipboardList",
  ENDPOINT: "/gp/gh/payroll/attendance-rules",
  QUERY_KEY: "attendance-rules",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    hour_type: "DIURNO",
    hours: null,
    multiplier: 1,
    pay: false,
    use_shift: false,
    created_at: "",
    updated_at: "",
  },
};
