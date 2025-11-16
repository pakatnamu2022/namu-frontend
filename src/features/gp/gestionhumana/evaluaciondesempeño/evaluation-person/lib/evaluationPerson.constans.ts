import { ModelComplete } from "@/core/core.interface";

const ROUTE = "evaluaciones";

export const EVALUATION_PERSON: ModelComplete = {
  MODEL: {
    name: "Evaluación de Desempeño",
    plural: "Evaluaciones de Desempeño",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/personResult",
  QUERY_KEY: "evaluationPersons",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
