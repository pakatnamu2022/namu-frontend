import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "periodos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const PAYROLL_PERIOD: ModelComplete = {
  MODEL: {
    name: "Periodo de Planilla",
    plural: "Periodos de Planilla",
    gender: false,
  },
  ICON: "Calendar",
  ENDPOINT: "/gp/gh/payroll/periods",
  QUERY_KEY: "payroll-periods",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
