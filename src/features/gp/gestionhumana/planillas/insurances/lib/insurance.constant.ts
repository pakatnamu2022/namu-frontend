import { type ModelComplete } from "@/core/core.interface";
import { InsuranceResource } from "./insurance.interface";

const ROUTE = "seguros";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const INSURANCE: ModelComplete<InsuranceResource> = {
  MODEL: {
    name: "Seguro",
    plural: "Seguros",
    gender: true,
  },
  ICON: "ShieldCheck",
  ENDPOINT: "/gp/gh/payroll/insurances",
  QUERY_KEY: "insurances",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
