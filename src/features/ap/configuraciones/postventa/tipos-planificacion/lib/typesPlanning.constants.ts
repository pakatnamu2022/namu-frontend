import { type ModelComplete } from "@/core/core.interface.ts";
import { TypesPlanningResource } from "./typesPlanning.interface.ts";

const ROUTE = "tipos-planificacion";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const TYPE_PLANNING: ModelComplete<TypesPlanningResource> = {
  MODEL: {
    name: "Tipo de Planificación",
    plural: "Tipos de Planificación",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/typePlanningWorkOrder",
  QUERY_KEY: "typesPlanning",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    validate_receipt: false,
    validate_labor: false,
    type_document: "INTERNA",
    status: true,
  },
};
