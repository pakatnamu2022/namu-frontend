import { type ModelComplete } from "@/core/core.interface.ts";
import { WorkOrderLabourResource } from "./workOrderLabour.interface";

const ROUTE = "orden-trabajo";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const WORKER_ORDER_LABOUR: ModelComplete<WorkOrderLabourResource> = {
  MODEL: {
    name: "Labor de Orden de Trabajo",
    plural: "Labores de Orden de Trabajo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrderLabour",
  QUERY_KEY: "workOrderLabour",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
