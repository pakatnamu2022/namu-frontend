import { ModelComplete } from "@/src/core/core.interface";

const ROUTE = "ciclos";

export const ENDPOINT_DETAIL = "/gp/gh/performanceEvaluation/personCycleDetail";

export const CYCLE: ModelComplete = {
  MODEL: {
    name: "Ciclo",
    plural: "Ciclos",
    gender: false,
  },
  ICON: "ChartBarStacked",
  ENDPOINT: "/gp/gh/performanceEvaluation/cycle",
  QUERY_KEY: "cycle",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
