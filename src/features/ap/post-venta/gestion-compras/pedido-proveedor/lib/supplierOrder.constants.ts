import { ModelComplete } from "@/core/core.interface";
import { SupplierOrderResource } from "./supplierOrder.interface";

const ROUTE = "pedido-proveedor";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-compras/" + ROUTE;

export const SUPPLIER_ORDER: ModelComplete<SupplierOrderResource> = {
  MODEL: {
    name: "Pedido a Proveedor",
    plural: "Pedidos a Proveedor",
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
