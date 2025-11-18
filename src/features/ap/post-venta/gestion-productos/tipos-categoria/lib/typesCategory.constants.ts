import { type ModelComplete } from "@/core/core.interface";
import { POSTVENTA_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";
import { TypesCategoryResource } from "./typesCategory.interface";

const ROUTE = "tipos-categoria";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-productos/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
