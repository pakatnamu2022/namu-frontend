import { ModelComplete } from "@/core/core.interface";
import { DevelopmentPlanResource } from "./developmentPlan.interface";

const ROUTE = "plan-desarrollo";
const ABSOLUTE_ROUTE = `/perfil/equipo/:id/${ROUTE}`;

export const DEVELOPMENT_PLAN: ModelComplete<DevelopmentPlanResource> = {
  MODEL: {
    name: "Plan de Desarrollo",
    plural: "Planes de Desarrollo",
    gender: false,
  },
  ICON: "FileText",
  ENDPOINT: "/gp/gh/performanceEvaluation/detailedDevelopmentPlan",
  QUERY_KEY: "development-plans",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
