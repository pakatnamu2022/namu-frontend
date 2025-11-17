import { type ModelComplete } from "@/core/core.interface";
import { ProductTypeResource } from "./productType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "tipos-producto";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
