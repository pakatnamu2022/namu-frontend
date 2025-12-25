import { type ModelComplete } from "@/core/core.interface.ts";
import { OrderQuotationDetailsResource } from "./proformaDetails.interface";
const ROUTE = "cotizacion-detalle";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const ORDER_QUOTATION_DETAILS: ModelComplete<OrderQuotationDetailsResource> =
  {
    MODEL: {
      name: "Item de Cotización",
      plural: "Items de Cotización",
      gender: false,
    },
    ICON: "FileText",
    ENDPOINT: "/ap/postVenta/orderQuotationDetails",
    QUERY_KEY: "orderQuotationDetails",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  };
