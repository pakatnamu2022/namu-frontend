import { type ModelComplete } from "@/core/core.interface.ts";
import { OrderQuotationResource } from "./proforma.interface";

// RUTAS PARA TALLER - POST VENTA
const ROUTE = "cotizacion-taller";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const ORDER_QUOTATION_TALLER: ModelComplete<OrderQuotationResource> = {
  MODEL: {
    name: "Cotización",
    plural: "Cotizaciones",
    gender: false,
  },
  ICON: "FileText",
  ENDPOINT: "/ap/postVenta/orderQuotations",
  QUERY_KEY: "orderQuotations",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// RUTAS PARA REPUESTOS - POST VENTA
const ROUTE_MESON = "cotizacion-meson";
const ABSOLUTE_ROUTE_MESON = `/ap/post-venta/repuestos/${ROUTE_MESON}`;

export const ORDER_QUOTATION_MESON: ModelComplete<OrderQuotationResource> = {
  MODEL: {
    name: "Cotización",
    plural: "Cotizaciones",
    gender: false,
  },
  ICON: "FileText",
  ENDPOINT: "/ap/postVenta/orderQuotations",
  QUERY_KEY: "orderQuotations",
  ROUTE: ROUTE_MESON,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_MESON,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_MESON}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_MESON}/actualizar`,
};

// RUTAS PARA CAJA - POST VENTA
const ROUTE_CAJA = "cotizacion-repuesto-caja";
const ABSOLUTE_ROUTE_CAJA = `/ap/post-venta/caja/${ROUTE_CAJA}`;
export const ORDER_QUOTATION_CAJA: ModelComplete<OrderQuotationResource> = {
  MODEL: {
    name: "Cotización",
    plural: "Cotizaciones",
    gender: false,
  },
  ICON: "FileText",
  ENDPOINT: "/ap/postVenta/orderQuotations",
  QUERY_KEY: "orderQuotations",
  ROUTE: ROUTE_CAJA,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_CAJA,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_CAJA}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_CAJA}/actualizar`,
};

export const SUPPLY_TYPE = {
  STOCK: "REPUESTO",
  LIMA: "LIMA",
  IMPORTACION: "IMPORTACION",
};

export const STATUS_ORDER_QUOTATION = {
  OPEN: "Aperturado",
  DISCARDED: "Descartado",
  TO_BILL: "Por Facturar",
  BILLED: "Facturado",
};
