import { type ModelComplete } from "@/core/core.interface.ts";
import { OperatorWorkOrderResource } from "./operatorWorkOrder.interface";
const ROUTE = "orden-trabajo-operario";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const OPERATOR_WORKER_ORDER: ModelComplete<OperatorWorkOrderResource> = {
  MODEL: {
    name: "Orden de Trabajo Operario",
    plural: "Ordenes de Trabajo Operario",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrderAssignOperators",
  QUERY_KEY: "workOrderAssignOperators",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
