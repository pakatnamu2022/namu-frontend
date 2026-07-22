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

export const WORK_ORDER_STATUS_COLORS: Record<number, BadgeColor> = {
  884: "blue", // APERTURADO
  889: "cyan", // RECEPCIONADO
  890: "amber", // EN TRABAJO
  891: "green", // FINALIZO TRABAJO
  892: "sky", // TERMINADO
  893: "gray", // CERRADO
  894: "red", // ANULADO
};

// IDs DE ESTADOS DE ORDEN DE TRABAJO
export const STATUS_WORK_ORDER = {
  APERTURADO: 884,
  RECEPCIONADO: 889,
  EN_TRABAJO: 890,
  FIN_TRABAJO: 891,
  TERMINADO: 892, // FACTURA FINAL
  CERRADO: 893,
  ANULADO: 894,
} as const;

export const finishAllowedStatuses: number[] = [
  STATUS_WORK_ORDER.APERTURADO,
  STATUS_WORK_ORDER.RECEPCIONADO,
  STATUS_WORK_ORDER.EN_TRABAJO,
  STATUS_WORK_ORDER.FIN_TRABAJO,
];

// AGRUPACION DE ESTADOS PARA EL FILTRO "OTs ABIERTAS / CERRADAS / ANULADAS"
export const WORK_ORDER_STATUS_GROUP = {
  ABIERTAS: "abiertas",
  CERRADAS: "cerradas",
  ANULADAS: "anuladas",
} as const;

export type WorkOrderStatusGroup =
  (typeof WORK_ORDER_STATUS_GROUP)[keyof typeof WORK_ORDER_STATUS_GROUP];

export const WORK_ORDER_STATUS_GROUP_IDS: Record<
  WorkOrderStatusGroup,
  number[]
> = {
  [WORK_ORDER_STATUS_GROUP.ABIERTAS]: [
    STATUS_WORK_ORDER.APERTURADO,
    STATUS_WORK_ORDER.RECEPCIONADO,
    STATUS_WORK_ORDER.EN_TRABAJO,
    STATUS_WORK_ORDER.FIN_TRABAJO,
    STATUS_WORK_ORDER.TERMINADO,
  ],
  [WORK_ORDER_STATUS_GROUP.CERRADAS]: [STATUS_WORK_ORDER.CERRADO],
  [WORK_ORDER_STATUS_GROUP.ANULADAS]: [STATUS_WORK_ORDER.ANULADO],
};

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
