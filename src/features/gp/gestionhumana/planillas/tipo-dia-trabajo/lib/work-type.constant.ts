import { type ModelComplete } from "@/core/core.interface";
import { WorkTypeResource } from "./work-type.interface";

const ROUTE = "tipo-dia-trabajo";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const WORK_TYPE: ModelComplete<WorkTypeResource> = {
  MODEL: {
    name: "Tipo Día Trabajo",
    plural: "Tipos Día Trabajo",
    gender: false,
  },
  ICON: "Clock",
  ENDPOINT: "/gp/gh/payroll/work-types",
  QUERY_KEY: "work-types",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    name: "",
    description: "",
    multiplier: 1,
    base_hours: 8,
    is_extra_hours: false,
    is_night_shift: false,
    is_holiday: false,
    is_sunday: false,
    active: true,
    order: 0,
    created_at: "",
    updated_at: "",
  },
};
