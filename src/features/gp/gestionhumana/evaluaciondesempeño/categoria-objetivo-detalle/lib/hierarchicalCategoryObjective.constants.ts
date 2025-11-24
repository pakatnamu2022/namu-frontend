import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "objetivos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

export const CATEGORY_OBJECTIVE: ModelComplete = {
  MODEL: {
    name: "Objetivo de Categoria",
    plural: "Objetivos de Categoria",
    gender: false,
  },
  ICON: "Dumbbell",
  ENDPOINT: "/gp/gh/performanceEvaluation/categoryObjectiveDetail",
  QUERY_KEY: "categoryObjectiveDetail",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
