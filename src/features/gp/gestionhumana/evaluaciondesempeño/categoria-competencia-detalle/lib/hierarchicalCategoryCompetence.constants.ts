import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "competencias";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
