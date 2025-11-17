import { type ModelComplete } from "@/core/core.interface";
import { DeliveryChecklistResource } from "./deliveryChecklist.interface";

const ROUTE = "checklist-entrega";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const ITEM_DELIVERY: ModelComplete<DeliveryChecklistResource> = {
  MODEL: {
    name: "Checklist de entrega",
    plural: "Checklists de entrega",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/deliveryReceivingChecklist",
  QUERY_KEY: "deliveryChecklist",
  ROUTE,
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    has_quantity: false,
    status: true,
    category_id: 0,
  },
};
