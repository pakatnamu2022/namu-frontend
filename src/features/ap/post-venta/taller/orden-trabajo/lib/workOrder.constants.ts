import { type ModelComplete } from "@/core/core.interface.ts";
import { WorkOrderResource } from "./workOrder.interface";

// RUTAS PARA POSTVENTA - TALLER
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

// ESTADOS DE ORDEN DE TRABAJO
export const WORK_ORDER_STATUS = {
  APERTURADO: "APERTURADO",
  RECEPCIONADO: "RECEPCIONADO",
  EN_TRABAJO: "EN TRABAJO",
  TERMINADO: "TERMINADO",
  CERRADO: "CERRADO",
  ANULADO: "ANULADO",
} as const;

// RUTAS PARA POSTVENTA - CAJA
const ROUTE_CAJA = "orden-trabajo-taller-caja";
const ABSOLUTE_ROUTE_CAJA = `/ap/post-venta/caja/${ROUTE_CAJA}`;
export const WORKER_ORDER_CAJA: ModelComplete<WorkOrderResource> = {
  MODEL: {
    name: "Orden de Trabajo",
    plural: "Ordenes de Trabajo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrders",
  QUERY_KEY: "workOrders",
  ROUTE: ROUTE_CAJA,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_CAJA,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_CAJA}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_CAJA}/actualizar`,
};
