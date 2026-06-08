import { type BadgeColor } from "@/components/ui/badge";

const ROUTE_MESON = "cotizacion-meson";
const ABSOLUTE_ROUTE_MESON = `/ap/post-venta/repuestos/${ROUTE_MESON}`;

export const DISCOUNT_REQUEST_MESON = {
  QUERY_KEY: "discount-request-order-quotation",
  ROUTE_REQUEST_DISCOUNT: `${ABSOLUTE_ROUTE_MESON}/solicitar-descuento`,
};

export const TYPE_GLOBAL = "GLOBAL";
export const TYPE_PARTIAL = "PARTIAL";

export const STATUS_PENDING = "pending";
export const STATUS_APPROVED = "approved";
export const STATUS_REJECTED = "rejected";

export const DISCOUNT_REQUEST_STATUS_COLOR: Record<string, BadgeColor> = {
  [STATUS_APPROVED]: "green",
  [STATUS_REJECTED]: "red",
  [STATUS_PENDING]: "orange",
};

export const DISCOUNT_REQUEST_STATUS_LABEL: Record<string, string> = {
  [STATUS_APPROVED]: "Aprobado",
  [STATUS_REJECTED]: "Rechazado",
  [STATUS_PENDING]: "Pendiente",
};
