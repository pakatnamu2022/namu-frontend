import { ModelComplete } from "@/src/core/core.interface";

const ROUTE = "objetivos";

export const OBJECTIVE: ModelComplete = {
  MODEL: {
    name: "Objetivo de Categoria",
    plural: "Objetivos de Categoria",
    gender: false,
  },
  ICON: "Dumbbell",
  ENDPOINT: "/gp/gh/performanceEvaluation/objective",
  QUERY_KEY: "categoryObjectiveDetail",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
