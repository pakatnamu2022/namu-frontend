import { type ModelComplete } from "@/core/core.interface.ts";
import { OrderQuotationResource } from "./proforma.interface";
import { type BadgeColor } from "@/components/ui/badge";

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

// IDs DE ESTADOS DE COTIZACIÓN (STATUS_ORDER_QUOTE)
export const STATUS_ORDER_QUOTE = {
  APERTURADO: 1282,
  APROBADO: 1283,
  FACTURAR: 1284,
  FACTURADO: 1285,
  SEGMENTADO: 1286,
  DESCARTADO: 1304,
} as const;

export const STATUS_ORDER_QUOTE_COLOR: Record<number, BadgeColor> = {
  [STATUS_ORDER_QUOTE.APERTURADO]: "blue",
  [STATUS_ORDER_QUOTE.APROBADO]: "cyan",
  [STATUS_ORDER_QUOTE.FACTURAR]: "orange",
  [STATUS_ORDER_QUOTE.FACTURADO]: "green",
  [STATUS_ORDER_QUOTE.SEGMENTADO]: "purple",
  [STATUS_ORDER_QUOTE.DESCARTADO]: "red",
};
