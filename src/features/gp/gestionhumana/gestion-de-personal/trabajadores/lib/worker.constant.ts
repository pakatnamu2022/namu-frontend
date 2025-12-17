import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "trabajadores";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const WORKER: ModelComplete = {
  MODEL: {
    name: "Trabajador",
    plural: "Trabajadores",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/personal/worker",
  QUERY_KEY: "worker",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
