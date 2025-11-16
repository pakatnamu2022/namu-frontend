import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "gestionar-leads";

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
};
