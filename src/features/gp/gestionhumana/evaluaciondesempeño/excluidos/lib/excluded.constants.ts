import { ModelComplete } from "@/core/core.interface";

const ROUTE = "excluidos";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
