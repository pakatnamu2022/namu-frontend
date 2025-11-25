import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "excluidos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

export const EXCLUDED: ModelComplete = {
  MODEL: {
    name: "Persona Excluida",
    plural: "Personas Excluidas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/evaluationPersonDetail",
  QUERY_KEY: "excluded",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
