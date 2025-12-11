import { type ModelComplete } from "@/core/core.interface.ts";
import { OrderQuotationResource } from "./proforma.interface";
const ROUTE = "cotizacion";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const ORDER_QUOTATION: ModelComplete<OrderQuotationResource> = {
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
