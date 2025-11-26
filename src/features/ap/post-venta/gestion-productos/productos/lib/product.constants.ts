import { type ModelComplete } from "@/core/core.interface";
import { ProductResource } from "./product.interface";

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
  EMPTY: {
    id: 0,
    code: "",
    name: "",
    product_category_id: 0,
    unit_measurement_id: 0,
    ap_class_article_id: 0,
    sale_price: "0",
    status: "ACTIVE" as const,
  },
};
