import { ModelComplete } from "@/core/core.interface";
import { RoleResource } from "./role.interface";

const ROUTE = "roles";
const ABSOLUTE_ROUTE = `/gp/gestionsistema/${ROUTE}`;

export const ROLE: ModelComplete<RoleResource> = {
  MODEL: {
    name: "roles",
    plural: "roles",
    gender: false,
  },
  ROUTE,
  ABSOLUTE_ROUTE,
  ENDPOINT: "/gp/gestionsistema/roles",
  ICON: "ShieldCheck",
  QUERY_KEY: "roles",
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    nombre: "",
    descripcion: "",
    users: 0,
  },
};
