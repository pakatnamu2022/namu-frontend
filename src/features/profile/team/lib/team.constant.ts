import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "metricas";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/configuraciones/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
