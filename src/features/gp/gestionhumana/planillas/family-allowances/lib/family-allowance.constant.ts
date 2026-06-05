import { type ModelComplete } from "@/core/core.interface";
import { FamilyAllowanceResource } from "./family-allowance.interface";

const ROUTE = "asignacion-familiar";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const FAMILY_ALLOWANCE: ModelComplete<FamilyAllowanceResource> = {
  MODEL: {
    name: "Asignación Familiar",
    plural: "Asignaciones Familiares",
    gender: false,
  },
  ICON: "Users",
  ENDPOINT: "/gp/gh/payroll/family-allowances",
  QUERY_KEY: "family-allowances",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/asignar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/asignar`,
};
