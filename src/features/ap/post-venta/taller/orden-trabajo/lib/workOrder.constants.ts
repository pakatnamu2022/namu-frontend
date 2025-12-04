import { type ModelComplete } from "@/core/core.interface.ts";
import { WorkOrderResource } from "./workOrder.interface";

const ROUTE = "orden-trabajo";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const WORKER_ORDER: ModelComplete<WorkOrderResource> = {
  MODEL: {
    name: "Orden de Trabajo",
    plural: "Ordenes de Trabajo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrders",
  QUERY_KEY: "workOrders",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
