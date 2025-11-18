import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "periodos";

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
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
