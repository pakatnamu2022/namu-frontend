import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "contratos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const CONTRACT: ModelComplete = {
  MODEL: {
    name: "Contrato",
    plural: "Contratos",
    gender: false,
  },
  ICON: "FileText",
  ENDPOINT: "/gp/gh/contratos/contract",
  QUERY_KEY: "contract",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
