import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "competencias";

export const COMPETENCE: ModelComplete = {
  MODEL: {
    name: "Competencia",
    plural: "Competencias",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/competence",
  QUERY_KEY: "competencias",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
