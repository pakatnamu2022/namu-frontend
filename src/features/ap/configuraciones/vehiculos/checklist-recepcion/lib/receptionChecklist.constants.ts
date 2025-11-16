import { type ModelComplete } from "@/core/core.interface";
import { ReceptionChecklistResource } from "./receptionChecklist.interface";

const ROUTE = "checklist-recepcion";

export const ITEM_RECEPTION: ModelComplete<ReceptionChecklistResource> = {
  MODEL: {
    name: "Checklist de recepción",
    plural: "Checklists de recepción",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/deliveryReceivingChecklist",
  QUERY_KEY: "receptionChecklist",
  ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    has_quantity: false,
    status: true,
    category_id: 0,
  },
};
