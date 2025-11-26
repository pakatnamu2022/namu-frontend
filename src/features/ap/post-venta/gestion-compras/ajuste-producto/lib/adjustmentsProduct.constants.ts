import { ModelComplete } from "@/core/core.interface";
import { AdjustmentsProductResource } from "./adjustmentsProduct.interface";
import { AP_MASTER_POST_VENTA } from "@/features/ap/lib/ap.constants";

const ROUTE = "ajuste-producto";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-compras";

export const ADJUSTMENT: ModelComplete<AdjustmentsProductResource> = {
  MODEL: {
    name: "Ajuste de Inventario",
    plural: "Ajustes de Inventario",
    gender: false,
  },
  ICON: "PackageCheck",
  ENDPOINT: "/ap/postVenta/inventoryMovements",
  QUERY_KEY: "inventory-movements",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/${ROUTE}/actualizar`,
};

export const ALL_MOVEMENT_TYPES = [
  {
    value: AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_IN,
    label: "Ajuste de Ingreso",
  },
  {
    value: AP_MASTER_POST_VENTA.TYPE_ADJUSTMENT_OUT,
    label: "Ajuste de Salida", 
  },
] as const;

export const MOVEMENT_TYPE_COLORS = {
  ADJUSTMENT_IN: "bg-green-100 text-green-800",
  ADJUSTMENT_OUT: "bg-red-100 text-red-800",
} as const;

/**
 * Traducciones para movement_type
 */
export function translateMovementType(type?: string | null): string {
  const translations: Record<string, string> = {
    ADJUSTMENT_IN: "Ajuste de Ingreso",
    ADJUSTMENT_OUT: "Ajuste de Salida",
  };
  return type ? translations[type] ?? type : "-";
}

/**
 * Obtener color según tipo de movimiento
 */
export function getMovementTypeColor(type?: string | null): string {
  if (!type) return "bg-gray-100 text-gray-800";
  return (
    MOVEMENT_TYPE_COLORS[type as keyof typeof MOVEMENT_TYPE_COLORS] ||
    "bg-gray-100 text-gray-800"
  );
}

/**
 * Determinar si es un movimiento de ingreso
 */
export function isInboundMovement(type?: string | null): boolean {
  return type === "ADJUSTMENT_IN";
}

/**
 * Determinar si es un movimiento de salida
 */
export function isOutboundMovement(type?: string | null): boolean {
  return ["ADJUSTMENT_OUT", "LOSS", "DAMAGE"].includes(type || "");
}
