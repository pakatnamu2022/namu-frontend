import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "vistas";
const ABSOLUTE_ROUTE = "/gp/gestion-del-sistema/" + ROUTE;

export const VIEW: ModelComplete = {
  MODEL: {
    name: "Vista",
    plural: "Vistas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/configuration/view",
  QUERY_KEY: "views",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
