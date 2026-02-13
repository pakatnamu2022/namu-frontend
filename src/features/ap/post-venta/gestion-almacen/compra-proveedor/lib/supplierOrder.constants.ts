import { ModelComplete } from "@/core/core.interface.ts";
import { SupplierOrderResource } from "./supplierOrder.interface.ts";

const ROUTE = "compra-proveedor";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-almacen/" + ROUTE;

export const SUPPLIER_ORDER: ModelComplete<SupplierOrderResource> = {
  MODEL: {
    name: "Compra a Proveedor",
    plural: "Compras a Proveedor",
    gender: false,
  },
  ICON: "Package",
  ENDPOINT: "/ap/postVenta/supplierOrders",
  QUERY_KEY: "supplier-orders",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
