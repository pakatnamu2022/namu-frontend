import { type ModelComplete } from "@/core/core.interface.ts";
import { type BadgeColor } from "@/components/ui/badge";
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

// RUTAS PARA RECEPCION DE ORDEN DE TRABAJO - TALLER
const ROUTE_RECEPCION = "recepcion-orden-trabajo";
const ABSOLUTE_ROUTE_RECEPCION = `/ap/post-venta/taller/${ROUTE_RECEPCION}`;

export const WORKER_ORDER_RECEPCION: ModelComplete<WorkOrderResource> = {
  MODEL: {
    name: "Orden de Trabajo",
    plural: "Ordenes de Trabajo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrders",
  QUERY_KEY: "workOrders",
  ROUTE: ROUTE_RECEPCION,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_RECEPCION,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_RECEPCION}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_RECEPCION}/actualizar`,
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

export const WORK_ORDER_STATUS_COLORS: Record<string, BadgeColor> = {
  APERTURADO: "blue",
  RECEPCIONADO: "cyan",
  "EN TRABAJO": "amber",
  TERMINADO: "green",
  CERRADO: "gray",
  ANULADO: "red",
};

// IDs DE ESTADOS DE ORDEN DE TRABAJO
export const WORK_ORDER_STATUS_ID = {
  APERTURADO: 884,
  RECEPCIONADO: 889,
  EN_TRABAJO: 890,
  TERMINADO: 891,
  CERRADO: 892,
  ANULADO: 893,
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
