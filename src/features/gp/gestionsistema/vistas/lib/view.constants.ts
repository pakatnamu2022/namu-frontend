import { ModelComplete } from "@/core/core.interface";

const ROUTE = "vistas";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
