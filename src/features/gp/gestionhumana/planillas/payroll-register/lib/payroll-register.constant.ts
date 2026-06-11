import { type ModelComplete } from "@/core/core.interface";
import { PayrollRegisterResource } from "./payroll-register.interface";

const ROUTE = "registro-planilla";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const PAYROLL_REGISTER: ModelComplete<PayrollRegisterResource> = {
  MODEL: {
    name: "Registro de Planilla",
    plural: "Registros de Planilla",
    gender: true,
  },
  ICON: "TableProperties",
  ENDPOINT: "/gp/gh/payroll/register",
  QUERY_KEY: "payroll-register",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
