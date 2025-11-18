import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "competencias";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
