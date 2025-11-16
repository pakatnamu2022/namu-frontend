import { ModelComplete } from "@/core/core.interface";

const ROUTE = "trabajadores";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
