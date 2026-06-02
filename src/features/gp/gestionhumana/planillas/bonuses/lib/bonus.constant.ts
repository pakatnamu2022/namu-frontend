import { type ModelComplete } from "@/core/core.interface";
import { BonusResource } from "./bonus.interface";

const ROUTE = "bonificaciones";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const BONUS: ModelComplete<BonusResource> = {
  MODEL: {
    name: "Bonificación",
    plural: "Bonificaciones",
    gender: false,
  },
  ICON: "BadgeDollarSign",
  ENDPOINT: "/gp/gh/payroll/bonuses",
  QUERY_KEY: "bonuses",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
