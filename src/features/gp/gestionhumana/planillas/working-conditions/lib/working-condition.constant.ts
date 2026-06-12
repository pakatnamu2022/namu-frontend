import { type ModelComplete } from "@/core/core.interface";
import { WorkingConditionResource } from "./working-condition.interface";

const ROUTE = "condiciones-trabajo";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const WORKING_CONDITION: ModelComplete<WorkingConditionResource> = {
  MODEL: {
    name: "Condición de Trabajo",
    plural: "Condiciones de Trabajo",
    gender: true,
  },
  ICON: "Briefcase",
  ENDPOINT: "/gp/gh/payroll/working-conditions",
  QUERY_KEY: "working-conditions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
