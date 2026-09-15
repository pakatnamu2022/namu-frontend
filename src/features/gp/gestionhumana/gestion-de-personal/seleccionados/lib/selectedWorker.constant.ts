import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "seleccionados";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const SELECTED_WORKER: ModelComplete = {
  MODEL: {
    name: "Seleccionado",
    plural: "Seleccionados",
    gender: false,
  },
  ICON: "UserCheck",
  ENDPOINT: "/gp/gh/reclutamiento/selected-worker",
  QUERY_KEY: "selectedWorker",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const LIFE_STATUS = {
  ALTA: 22,
  BAJA: 23,
} as const;
