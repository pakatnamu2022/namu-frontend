import { type ModelComplete } from "@/core/core.interface.ts";
import { WorkOrderItemResource } from "./workOrderItem.interface";

const ROUTE = "orden-trabajo-item";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const WORKER_ORDER_ITEM: ModelComplete<WorkOrderItemResource> = {
  MODEL: {
    name: "Trabajo",
    plural: "Trabajos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrderItems",
  QUERY_KEY: "workOrderItems",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
