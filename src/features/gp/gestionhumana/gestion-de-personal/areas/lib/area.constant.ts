import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "areas";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/configuraciones/${ROUTE}`;

export const AREA: ModelComplete = {
  MODEL: {
    name: "Área",
    plural: "Áreas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/personal/area",
  QUERY_KEY: "areas",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
