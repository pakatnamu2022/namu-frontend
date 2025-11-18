import { type ModelComplete } from "@/core/core.interface";
import { TaxClassTypesResource } from "./taxClassTypes.interface";

const ROUTE = "tipos-clase-impuesto";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const TAX_CLASS_TYPES: ModelComplete<TaxClassTypesResource> = {
  MODEL: {
    name: "Tipo Clase Impuesto",
    plural: "Tipos Clase Impuesto",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/taxClassTypes",
  QUERY_KEY: "taxClassTypes",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    dyn_code: "",
    description: "",
    tax_class: "",
    type: "",
    status: true,
  },
};
