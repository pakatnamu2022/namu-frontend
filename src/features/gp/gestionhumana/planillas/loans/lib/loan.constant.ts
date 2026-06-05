import { type ModelComplete } from "@/core/core.interface";
import { LoanResource } from "./loan.interface";

const ROUTE = "prestamos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const LOAN: ModelComplete<LoanResource> = {
  MODEL: {
    name: "Préstamo",
    plural: "Préstamos",
    gender: false,
  },
  ICON: "HandCoins",
  ENDPOINT: "/gp/gh/payroll/loans",
  QUERY_KEY: "loans",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
