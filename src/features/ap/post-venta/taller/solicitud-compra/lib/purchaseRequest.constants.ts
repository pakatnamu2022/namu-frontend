import { type ModelComplete } from "@/core/core.interface.ts";
import { PurchaseRequestResource } from "./purchaseRequest.interface";

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
