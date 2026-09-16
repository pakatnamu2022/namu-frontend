import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "tipos-contrato";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const CONTRACT_TYPE: ModelComplete = {
  MODEL: {
    name: "Tipo de Contrato",
    plural: "Tipos de Contrato",
    gender: false,
  },
  ICON: "Tags",
  ENDPOINT: "/gp/gh/contratos/contract-type",
  QUERY_KEY: "contractType",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
