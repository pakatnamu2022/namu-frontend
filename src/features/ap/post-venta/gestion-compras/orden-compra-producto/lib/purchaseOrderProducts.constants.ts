import { ModelComplete } from "@/core/core.interface";
import { PurchaseOrderProductsResource } from "./purchaseOrderProducts.interface";

const ROUTE = "orden-compra-producto";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-compras/" + ROUTE;

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

export const PURCHASE_ORDER_STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  RECEIVED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
} as const;

export const PAYMENT_TERMS_OPTIONS = [
  { value: "CASH", label: "Contado" },
  { value: "15_DAYS", label: "15 días" },
  { value: "30_DAYS", label: "30 días" },
  { value: "45_DAYS", label: "45 días" },
  { value: "60_DAYS", label: "60 días" },
  { value: "90_DAYS", label: "90 días" },
] as const;

export const SHIPPING_METHOD_OPTIONS = [
  { value: "PICKUP", label: "Recojo en tienda" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "COURIER", label: "Courier" },
  { value: "FREIGHT", label: "Transporte de carga" },
] as const;
