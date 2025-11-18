import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "ciclos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
};
