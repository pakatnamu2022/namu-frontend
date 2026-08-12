import { type ModelComplete, type Option } from "@/core/core.interface";
import { PurchaseOrdersResource } from "./purchaseOrders.interface";

const ROUTE = "ordenes-compra";
const ABSOLUTE_ROUTE = `/ap/marketing/${ROUTE}`;

export const MARKETING_PURCHASE_ORDERS: ModelComplete<PurchaseOrdersResource> = {
  MODEL: {
    name: "Orden de Compra",
    plural: "Órdenes de Compra",
    gender: true,
  },
  ICON: "ShoppingCart",
  ENDPOINT: "/ap/marketing/purchase-orders",
  QUERY_KEY: "marketing-purchase-orders",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PURCHASE_ORDER_STATUS_OPTIONS: Option[] = [
  { label: "Borrador", value: "draft" },
  { label: "Enviada", value: "sent" },
  { label: "En Ejecución", value: "in_execution" },
  { label: "Pendiente de Sustento", value: "pending_support" },
  { label: "Sustentada", value: "supported" },
  { label: "Pendiente de Facturación", value: "pending_billing" },
  { label: "Facturada", value: "billed" },
  { label: "Cerrada", value: "closed" },
  { label: "Cancelada", value: "cancelled" },
];

export const PURCHASE_ORDER_NEXT_STATUS: Record<string, { value: string; label: string } | undefined> = {
  draft: { value: "sent", label: "Marcar enviada" },
  sent: { value: "in_execution", label: "Marcar en ejecución" },
  in_execution: { value: "pending_support", label: "Marcar pendiente de sustento" },
  pending_support: { value: "supported", label: "Marcar sustentada" },
  supported: { value: "pending_billing", label: "Marcar pendiente de facturación" },
  pending_billing: { value: "billed", label: "Marcar facturada" },
  billed: { value: "closed", label: "Marcar cerrada" },
};

export const PURCHASE_ORDER_CANCELLABLE_STATUSES = [
  "draft",
  "sent",
  "in_execution",
  "pending_support",
  "supported",
  "pending_billing",
  "billed",
];

export const PURCHASE_ORDER_EDITABLE_STATUSES = ["draft", "sent"];

export const PURCHASE_ORDER_DELETABLE_STATUSES = ["draft"];
