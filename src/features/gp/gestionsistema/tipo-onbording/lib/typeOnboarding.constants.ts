import { ModelComplete } from "@/core/core.interface";
import { TypeOnboardingResource } from "./typeOnboarding.interface";

const ROUTE = "tipos-onboarding";
const ABSOLUTE_ROUTE = `/gp/gestion-del-sistema/${ROUTE}`;

export const TYPE_ONBOARDING: ModelComplete<TypeOnboardingResource> = {
  MODEL: {
    name: "Tipo de onboarding",
    plural: "Tipos de onboarding",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/personal/type-onboarding",
  QUERY_KEY: "commercialMasters",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: { id: 0, name: "", status_deleted: true },
};
