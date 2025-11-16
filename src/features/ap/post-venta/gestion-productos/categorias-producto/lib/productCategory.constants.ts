import { type ModelComplete } from "@/core/core.interface";
import { ProductCategoryResource } from "./productCategory.interface";

const ROUTE = "categorias-producto";

export const PRODUCT_CATEGORY: ModelComplete<ProductCategoryResource> = {
  MODEL: {
    name: "Categoría de Producto",
    plural: "Categorías de Producto",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/productCategory",
  QUERY_KEY: "productCategory",
  ROUTE,
  EMPTY: {
    id: 0,
    name: "",
    description: "",
    type_id: "",
    status: true,
  },
};
