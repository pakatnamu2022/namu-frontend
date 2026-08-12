import { type ModelComplete } from "@/core/core.interface";
import { KpisResource } from "./kpis.interface";

const ROUTE = "kpis";
const ABSOLUTE_ROUTE = `/ap/marketing/${ROUTE}`;

export const KPIS: ModelComplete<KpisResource> = {
  MODEL: {
    name: "KPI",
    plural: "KPIs",
    gender: false,
  },
  ICON: "TrendingUp",
  ENDPOINT: "/ap/marketing/kpis",
  QUERY_KEY: "marketing-kpis",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
