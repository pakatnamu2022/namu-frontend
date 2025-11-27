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
