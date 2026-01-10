import { ModelComplete } from "@/core/core.interface";
import { InventoryResource } from "./inventory.interface";

// INVENTARIO EN ALMACÉN
const ROUTE = "inventario";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-de-compras/${ROUTE}`;

export const INVENTORY: ModelComplete<InventoryResource> = {
  MODEL: {
    name: "Inventario",
    plural: "Inventarios",
    gender: false,
  },
  ICON: "PackageCheck",
  ENDPOINT: "/ap/postVenta/productWarehouseStock",
  QUERY_KEY: "inventory-stocks",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/${ROUTE}/actualizar`,
};

// INVENTARIO REPUESTOS
const ROUTE_REPUESTOS = "inventario-repuesto";
const ABSOLUTE_ROUTE_REPUESTOS = `/ap/post-venta/repuestos/${ROUTE_REPUESTOS}`;

export const INVENTORY_REPUESTOS: ModelComplete<InventoryResource> = {
  MODEL: {
    name: "Inventario Repuesto",
    plural: "Inventarios Repuestos",
    gender: false,
  },
  ICON: "PackageCheck",
  ENDPOINT: "/ap/postVenta/productWarehouseStock",
  QUERY_KEY: "inventory-repuestos-stocks",
  ROUTE: ROUTE_REPUESTOS,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_REPUESTOS,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_REPUESTOS}/${ROUTE_REPUESTOS}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_REPUESTOS}/${ROUTE_REPUESTOS}/actualizar`,
};

/**
 * Traducciones para movement_type (tipo de movimiento de inventario)
 */
export function translateMovementType(type?: string | null): string {
  const translations: Record<string, string> = {
    PURCHASE_RECEPTION: "Recepción de Compra",
    SALE: "Venta",
    ADJUSTMENT_IN: "Ajuste de Entrada",
    ADJUSTMENT_OUT: "Ajuste de Salida",
    TRANSFER_OUT: "Transferencia Salida",
    TRANSFER_IN: "Transferencia Entrada",
    RETURN_IN: "Devolución Entrada",
    RETURN_OUT: "Devolución Salida",
  };
  return type ? translations[type] ?? type : "-";
}

/**
 * Traducciones para status (estado del movimiento)
 */
export function translateMovementStatus(status?: string | null): string {
  const translations: Record<string, string> = {
    DRAFT: "Borrador",
    APPROVED: "Aprobado",
    IN_TRANSIT: "En Tránsito",
    CANCELLED: "Cancelado",
  };
  return status ? translations[status] ?? status : "-";
}
