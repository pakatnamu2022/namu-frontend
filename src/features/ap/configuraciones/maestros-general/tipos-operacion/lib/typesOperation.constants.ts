import { ModelComplete } from "@/core/core.interface";
import { TypesOperationResource } from "./typesOperation.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-operacion";

export const TYPES_OPERATION: ModelComplete<TypesOperationResource> = {
  MODEL: {
    name: "Tipo de Operación",
    plural: "Tipos de Operaciones",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "typesOperation",
  ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
