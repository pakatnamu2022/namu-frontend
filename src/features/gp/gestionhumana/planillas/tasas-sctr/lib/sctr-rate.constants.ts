import { type ModelComplete } from "@/core/core.interface";
import { SctrRateResource } from "./sctr-rate.interface";

const ROUTE = "tasas-sctr";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const SCTR_RATE: ModelComplete<SctrRateResource> = {
  MODEL: {
    name: "Tasa SCTR",
    plural: "Tasas SCTR",
    gender: true,
  },
  ICON: "Percent",
  ENDPOINT: "/gp/gh/payroll/sctr-rates",
  QUERY_KEY: "payroll-sctr-rates",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}`,
};
