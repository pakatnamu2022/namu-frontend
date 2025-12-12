import { type ModelComplete } from "@/core/core.interface";
import { ProductCategoryResource } from "./productCategory.interface";
import { POSTVENTA_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "categorias-producto";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-productos/${ROUTE}`;

export const PRODUCT_CATEGORY: ModelComplete<ProductCategoryResource> = {
  MODEL: {
    name: "Categoría de Producto",
    plural: "Categorías de Producto",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: POSTVENTA_MASTERS_ENDPOINT,
  QUERY_KEY: "productCategory",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
