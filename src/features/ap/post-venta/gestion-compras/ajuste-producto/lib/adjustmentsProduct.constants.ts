import { ModelComplete } from "@/core/core.interface";
import { AdjustmentsProductResource } from "./adjustmentsProduct.interface";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

const ROUTE = "ajuste-producto";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-de-compras/${ROUTE}`;

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
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const ALL_MOVEMENT_TYPES = [
  {
    value: AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
    label: "Ajuste de Ingreso",
  },
  {
    value: AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT,
    label: "Ajuste de Salida",
  },
] as const;
