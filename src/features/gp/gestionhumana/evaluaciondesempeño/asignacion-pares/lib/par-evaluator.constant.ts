import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "asignacion-pares";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

export const PAR_EVALUATOR: ModelComplete = {
  MODEL: {
    name: "Evaluador Par",
    plural: "Evaluadores Pares",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/parEvaluator",
  QUERY_KEY: "par-evaluator",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
