import { type ModelComplete } from "@/core/core.interface";
import { ReceptionChecklistResource } from "./receptionChecklist.interface";

const ROUTE = "checklist-recepcion";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    has_quantity: false,
    status: true,
    category_id: 0,
  },
};
