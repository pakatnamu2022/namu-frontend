import { ModelComplete } from "@/core/core.interface.ts";
import { PurchaseOrderProductsResource } from "./purchaseOrderProducts.interface.ts";

const ROUTE = "pedido-proveedor";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-almacen/" + ROUTE;

export const PURCHASE_ORDER_PRODUCT: ModelComplete<PurchaseOrderProductsResource> =
  {
    MODEL: {
      name: "Orden de Compra",
      plural: "Ordenes de Compra",
      gender: false,
    },
    ICON: "Package",
    ENDPOINT: "/ap/commercial/vehiclePurchaseOrder",
    QUERY_KEY: "purchase-order-products",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  };

export const PURCHASE_ORDER_STATUS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "APPROVED", label: "Aprobado" },
  { value: "RECEIVED", label: "Recibido" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

export const PAYMENT_TERMS_OPTIONS = [
  { value: "CASH", label: "Contado" },
  { value: "15_DAYS", label: "15 días" },
  { value: "30_DAYS", label: "30 días" },
  { value: "45_DAYS", label: "45 días" },
  { value: "60_DAYS", label: "60 días" },
  { value: "90_DAYS", label: "90 días" },
] as const;
