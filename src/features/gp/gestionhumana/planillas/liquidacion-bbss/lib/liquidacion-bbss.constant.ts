import { type ModelComplete } from "@/core/core.interface";
import { LiquidacionBbssResource } from "./liquidacion-bbss.interface";

const ROUTE = "liquidacion-bbss";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const LIQUIDACION_BBSS: ModelComplete<LiquidacionBbssResource> = {
  MODEL: {
    name: "Liquidación BBSS",
    plural: "Liquidaciones BBSS",
    gender: true,
  },
  ICON: "FileText",
  ENDPOINT: "/gp/gh/payroll/liquidation-bbss",
  QUERY_KEY: "liquidation-bbss",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
