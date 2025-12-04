import { type ModelComplete } from "@/core/core.interface.ts";
import { WorkOrderPartsResource } from "./workOrderParts.interface";
const ROUTE = "orden-trabajo-repuesto";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const WORKER_ORDER_PARTS: ModelComplete<WorkOrderPartsResource> = {
  MODEL: {
    name: "Repuesto de Orden de Trabajo",
    plural: "Repuestos de Ordenes de Trabajo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrderParts",
  QUERY_KEY: "workOrderParts",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
