import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "metricas";

export const METRIC: ModelComplete = {
  MODEL: {
    name: "Métrica",
    plural: "Métricas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/metric",
  QUERY_KEY: "metrics",
  ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
