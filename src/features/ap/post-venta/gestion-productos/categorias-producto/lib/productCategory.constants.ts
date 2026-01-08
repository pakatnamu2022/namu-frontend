import { type ModelComplete } from "@/core/core.interface";
import { ProductCategoryResource } from "./productCategory.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "categorias-producto";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-productos/${ROUTE}`;

export const PRODUCT_CATEGORY: ModelComplete<ProductCategoryResource> = {
  MODEL: {
    name: "Categoría de Producto",
    plural: "Categorías de Producto",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
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
