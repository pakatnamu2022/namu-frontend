import { ModelComplete } from "@/src/core/core.interface";

const ROUTE = "subcompetencias";

export const SUBCOMPETENCE: ModelComplete = {
  MODEL: {
    name: "Subcompetencia",
    plural: "Subcompetencias",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/subcompetence",
  QUERY_KEY: "subcompetencias",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
