import { type ModelComplete } from "@/core/core.interface";
import { ProductResource } from "./product.interface";

// PRODUCTOS PARA ALMACENES
const ROUTE = "productos";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-productos/productos";

export const PRODUCT: ModelComplete<ProductResource> = {
  MODEL: {
    name: "Producto",
    plural: "Productos",
    gender: false,
  },
  ICON: "Package",
  ENDPOINT: "/ap/postVenta/products",
  QUERY_KEY: "products",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// PRODUCTOS PARA REPUESTOS
const ROUTE_REPUESTOS = "producto-repuesto";
const ABSOLUTE_ROUTE_REPUESTOS = "/ap/post-venta/repuestos/producto-repuesto";

export const PRODUCT_REPUESTOS: ModelComplete<ProductResource> = {
  MODEL: {
    name: "Producto Repuesto",
    plural: "Productos Repuestos",
    gender: false,
  },
  ICON: "Package",
  ENDPOINT: "/ap/postVenta/products",
  QUERY_KEY: "products",
  ROUTE: ROUTE_REPUESTOS,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_REPUESTOS,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_REPUESTOS}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_REPUESTOS}/actualizar`,
};
