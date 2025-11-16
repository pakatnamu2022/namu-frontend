import { type ModelComplete } from "@/core/core.interface";
import { POSTVENTA_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";
import { TypesCategoryResource } from "./typesCategory.interface";

const ROUTE = "tipos-categoria";

export const TYPES_CATEGORY: ModelComplete<TypesCategoryResource> = {
  MODEL: {
    name: "Tipo de Categoría",
    plural: "Tipos de Categoría",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: POSTVENTA_MASTERS_ENDPOINT,
  QUERY_KEY: "typesCategory",
  ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
