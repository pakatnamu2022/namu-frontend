import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "subcompetencias";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
