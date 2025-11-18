import { type ModelComplete } from "@/core/core.interface";
import { EVALUATION } from "../../evaluaciones/lib/evaluation.constans";

const { ABSOLUTE_ROUTE: EVALUATION_ABSOLUTE_ROUTE } = EVALUATION;

const ROUTE = "evaluaciones";
const ABSOLUTE_ROUTE = `${EVALUATION_ABSOLUTE_ROUTE}/detalles`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
