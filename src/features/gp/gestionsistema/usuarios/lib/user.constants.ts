import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "usuarios";
const ABSOLUTE_ROUTE = `/gp/gestion-del-sistema/${ROUTE}`;

export const USER: ModelComplete = {
  MODEL: {
    name: "Usuario",
    plural: "Usuarios",
    gender: true,
  },
  ICON: "Users",
  ENDPOINT: "/configuration/view",
  QUERY_KEY: "views",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
