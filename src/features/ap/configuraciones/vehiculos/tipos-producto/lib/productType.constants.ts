import { ModelComplete } from "@/src/core/core.interface";
import { ProductTypeResource } from "./productType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/src/features/ap/lib/ap.constants";

const ROUTE = "tipos-producto";

export const PRODUCT_TYPE: ModelComplete<ProductTypeResource> = {
  MODEL: {
    name: "Tipo de producto",
    plural: "Tipos de producto",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "productType",
  ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
