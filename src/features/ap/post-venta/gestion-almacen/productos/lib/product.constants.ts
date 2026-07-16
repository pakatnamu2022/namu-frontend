import { type ModelComplete } from "@/core/core.interface.ts";
import { ProductResource } from "./product.interface.ts";

export const PRODUCT_STATUS_CONFIG: Record<
  string,
  { color: "green" | "gray" | "red"; label: string }
> = {
  ACTIVE: { color: "green", label: "Activo" },
  INACTIVE: { color: "gray", label: "Inactivo" },
  DISCONTINUED: { color: "red", label: "Descontinuado" },
};

export const STOCK_STATUS_CONFIG: Record<
  string,
  { color: "green" | "orange" | "red" | "gray"; label: string }
> = {
  NORMAL: { color: "green", label: "Normal" },
  LOW_STOCK: { color: "orange", label: "Stock Bajo" },
  OUT_OF_STOCK: { color: "red", label: "Sin Stock" },
  OVER_STOCK: { color: "gray", label: "Sobre Stock" },
};

// PRODUCTOS PARA ALMACENES
const ROUTE = "productos";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-almacen/productos";

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

// PRODUCTOS PARA TALLER
const ROUTE_TALLER = "producto-taller";
const ABSOLUTE_ROUTE_TALLER = "/ap/post-venta/taller/producto-taller";

export const PRODUCT_TALLER: ModelComplete<ProductResource> = {
  MODEL: {
    name: "Producto Taller",
    plural: "Productos Taller",
    gender: false,
  },
  ICON: "Package",
  ENDPOINT: "/ap/postVenta/products",
  QUERY_KEY: "products",
  ROUTE: ROUTE_TALLER,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_TALLER,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_TALLER}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_TALLER}/actualizar`,
};
