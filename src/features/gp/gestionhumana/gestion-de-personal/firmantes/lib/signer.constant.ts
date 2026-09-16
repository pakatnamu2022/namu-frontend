import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "firmantes";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const SIGNER: ModelComplete = {
  MODEL: {
    name: "Firmante",
    plural: "Firmantes",
    gender: false,
  },
  ICON: "PenTool",
  ENDPOINT: "/gp/gh/contratos/signer",
  QUERY_KEY: "signer",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
