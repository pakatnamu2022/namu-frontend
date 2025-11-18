import { ModelComplete } from "@/core/core.interface";
import { ReceptionResource } from "./receptions-products.interface";

const ROUTE = "recepcion";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-compras/orden-compra-producto";

export const RECEPTION: ModelComplete<ReceptionResource> = {
  MODEL: {
    name: "Recepción de Productos",
    plural: "Recepciones de Productos",
    gender: false,
  },
  ICON: "PackageCheck",
  ENDPOINT: "/ap/commercial/productReception",
  QUERY_KEY: "product-receptions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/${ROUTE}/actualizar`,
};

export const RECEPTION_TYPES = [
  { value: "ORDERED", label: "Ordenado" },
  { value: "BONUS", label: "Bonificación" },
  { value: "GIFT", label: "Regalo" },
  { value: "SAMPLE", label: "Muestra" },
] as const;

export const REJECTION_REASONS = [
  { value: "DAMAGED", label: "Dañado" },
  { value: "DEFECTIVE", label: "Defectuoso" },
  { value: "EXPIRED", label: "Vencido" },
  { value: "WRONG_PRODUCT", label: "Producto Incorrecto" },
  { value: "WRONG_QUANTITY", label: "Cantidad Incorrecta" },
  { value: "POOR_QUALITY", label: "Mala Calidad" },
  { value: "OTHER", label: "Otro" },
] as const;

export const RECEPTION_TYPE_COLORS = {
  ORDERED: "bg-blue-100 text-blue-800",
  BONUS: "bg-green-100 text-green-800",
  GIFT: "bg-purple-100 text-purple-800",
  SAMPLE: "bg-orange-100 text-orange-800",
} as const;

export const REJECTION_REASON_COLORS = {
  DAMAGED: "bg-red-100 text-red-800",
  DEFECTIVE: "bg-orange-100 text-orange-800",
  EXPIRED: "bg-red-100 text-red-800",
  WRONG_PRODUCT: "bg-yellow-100 text-yellow-800",
  WRONG_QUANTITY: "bg-yellow-100 text-yellow-800",
  POOR_QUALITY: "bg-orange-100 text-orange-800",
  OTHER: "bg-gray-100 text-gray-800",
} as const;
