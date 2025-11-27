import { ModelComplete } from "@/core/core.interface";
import { InventoryResource } from "./inventory.interface";

const ROUTE = "ajuste-producto";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-compras";

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
