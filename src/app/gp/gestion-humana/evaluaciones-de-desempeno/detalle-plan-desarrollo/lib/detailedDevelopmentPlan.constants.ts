import { ModelComplete } from "@/core/core.interface";
import { DetailedDevelopmentPlanResource } from "./detailedDevelopmentPlan.interface";

const ROUTE = "detalle-plan-desarrollo";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

export const DETAILED_DEVELOPMENT_PLAN: ModelComplete<DetailedDevelopmentPlanResource> =
  {
    MODEL: {
      name: "Detalle de Plan de Desarrollo",
      plural: "Detalles de Planes de Desarrollo",
      gender: true,
    },
    ICON: "FileText",
    ENDPOINT: "/gp/gh/performanceEvaluation/detailedDevelopmentPlan",
    QUERY_KEY: "detailedDevelopmentPlan",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  };
