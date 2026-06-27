import { ModelComplete } from "@/core/core.interface.ts";
import { InventoryResource } from "./inventory.interface.ts";

// INVENTARIO EN ALMACÉN
const ROUTE = "inventario";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-de-almacen/${ROUTE}`;

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
  return type ? (translations[type] ?? type) : "-";
}

/**
 * Traducciones para status (estado del movimiento)
 */
export function translateInventoryMovement(status?: string | null): string {
  const translations: Record<string, string> = {
    DRAFT: "Borrador",
    APPROVED: "Aprobado",
    IN_TRANSIT: "En Tránsito",
    CANCELLED: "Cancelado",
  };
  return status ? (translations[status] ?? status) : "-";
}

/**
 * Traducciones para calculo de precio
 */

export function translatePriceCalculationStep(step: string): string {
  const translations: Record<string, string> = {
    movement_number: "Número de movimiento",
    movement_date: "Fecha del movimiento",
    quantity_purchased: "Cantidad comprada",
    unit_cost_original: "Costo unitario original",
    original_currency: "Moneda original",
    exchange_rate: "Tipo de cambio",
    unit_cost_in_pen: "Costo unitario en PEN",
    last_purchase_price: "Último precio de compra",
    current_stock: "Stock actual",
    average_cost: "Costo promedio actual del Repuesto",
    stock_before_last_purchase: "Stock antes de la última compra",
    last_purchase_quantity: "Cantidad de la última compra",
    previous_average_cost: "Costo promedio antes de la última compra",
    profit_margin: "Margen de ganancia",
    profit_margin_percent: "Margen de ganancia (%)",
    freight_commission: "Flete/Comisión",
    freight_commission_percent: "Flete/Comisión (%)",
    calculation_method: "Método utilizado",
    calculated_pvp: "PVP calculado",
    stored_sale_price: "Precio de venta almacenado",
    matches: "¿El precio calculado coincide con el precio de venta almacenado?",
    public_sale_price: "Precio de venta al público",
    minimum_discount: "Descuento mínimo",
    minimum_discount_percent: "Descuento mínimo (%)",
    minimum_sale_price: "Precio mínimo de venta",
  };
  return translations[step] ?? `Paso ${step}`;
}
