import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "modelo-evaluacion";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

export const EVALUATION_MODEL: ModelComplete = {
  MODEL: {
    name: "Modelo de Evaluación",
    plural: "Modelos de Evaluación",
    gender: false,
  },
  ICON: "FileChartColumn",
  ENDPOINT: "/gp/gh/performanceEvaluation/evaluationModel",
  QUERY_KEY: "evaluationModel",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
};
