import { type ModelComplete } from "@/core/core.interface.ts";
import { PurchaseRequestResource } from "./purchaseRequest.interface";

// Estados de solicitud de compra
export const PURCHASE_REQUEST_STATUS = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
} as const;

export type PurchaseRequestStatus = keyof typeof PURCHASE_REQUEST_STATUS;

// RUTAS PARA TALLER - SOLICITUD DE COMPRA
const ROUTE = "solicitud-compra";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const PURCHASE_REQUEST: ModelComplete<PurchaseRequestResource> = {
  MODEL: {
    name: "Solicitud de Compra",
    plural: "Solicitudes de Compra",
    gender: false,
  },
  ICON: "ShoppingCart",
  ENDPOINT: "/ap/postVenta/orderPurchaseRequests",
  QUERY_KEY: "orderPurchaseRequests",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// RUTAS PARA REPUESTOS - SOLICITUD DE COMPRA
const ROUTE_REPUESTOS = "solicitud-compra-repuesto";
const ABSOLUTE_ROUTE_REPUESTOS = `/ap/post-venta/repuestos/${ROUTE_REPUESTOS}`;

export const PURCHASE_REQUEST_REPUESTOS: ModelComplete<PurchaseRequestResource> =
  {
    MODEL: {
      name: "Solicitud de Compra",
      plural: "Solicitudes de Compra",
      gender: false,
    },
    ICON: "ShoppingCart",
    ENDPOINT: "/ap/postVenta/orderPurchaseRequests",
    QUERY_KEY: "orderPurchaseRequests",
    ROUTE: ROUTE_REPUESTOS,
    ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_REPUESTOS,
    ROUTE_ADD: `${ABSOLUTE_ROUTE_REPUESTOS}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE_REPUESTOS}/actualizar`,
  };

// RUTAS PARA ALMACÉN - SOLICITUD DE COMPRA
const ROUTE_ALMACEN = "solicitud-compra-almacen";
const ABSOLUTE_ROUTE_ALMACEN = `/ap/post-venta/gestion-de-almacen/${ROUTE_ALMACEN}`;

export const PURCHASE_REQUEST_ALMACEN: ModelComplete<PurchaseRequestResource> =
  {
    MODEL: {
      name: "Solicitud de Compra",
      plural: "Solicitudes de Compra",
      gender: false,
    },
    ICON: "ShoppingCart",
    ENDPOINT: "/ap/postVenta/orderPurchaseRequests",
    QUERY_KEY: "orderPurchaseRequests",
    ROUTE: ROUTE_ALMACEN,
    ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_ALMACEN,
    ROUTE_ADD: `${ABSOLUTE_ROUTE_ALMACEN}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE_ALMACEN}/actualizar`,
  };
