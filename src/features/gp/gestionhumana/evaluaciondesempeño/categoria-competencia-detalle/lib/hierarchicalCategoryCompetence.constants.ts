import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "competencias";

export const CATEGORY_COMPETENCE: ModelComplete = {
  MODEL: {
    name: "Competencia de Categoria",
    plural: "Competencias de Categoria",
    gender: false,
  },
  ICON: "BookmarkCheck",
  ENDPOINT: "/gp/gh/performanceEvaluation/categoryCompetenceDetail",
  QUERY_KEY: "categoryCompetenceDetail",
  ROUTE,
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
};
