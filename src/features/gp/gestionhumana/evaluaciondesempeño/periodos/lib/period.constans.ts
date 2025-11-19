import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "periodos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

export const PERIOD: ModelComplete = {
  MODEL: {
    name: "Período",
    plural: "Períodos",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/period",
  QUERY_KEY: "periodos",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
