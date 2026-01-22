import { type ModelComplete } from "@/core/core.interface.ts";
import { ProductTransferResource } from "./productTransfer.interface.ts";

const ROUTE = "transferencia-producto";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-de-compras/${ROUTE}`;

export const PRODUCT_TRANSFER: ModelComplete<ProductTransferResource> = {
  MODEL: {
    name: "Transferencia de Producto",
    plural: "Transferencias de Productos",
    gender: true,
  },
  ICON: "Package",
  ENDPOINT: "/ap/postVenta/inventoryMovements",
  QUERY_KEY: "product-transfers",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
