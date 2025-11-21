import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "gestionar-leads";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const MANAGE_LEADS: ModelComplete = {
  MODEL: {
    name: "Gestionar Lead",
    plural: "Gestionar Leads",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/potentialBuyers",
  QUERY_KEY: "storeVisits",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
