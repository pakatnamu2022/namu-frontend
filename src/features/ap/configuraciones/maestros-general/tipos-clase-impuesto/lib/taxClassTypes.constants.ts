import { ModelComplete } from "@/src/core/core.interface";
import { TaxClassTypesResource } from "./taxClassTypes.interface";

const ROUTE = "tipos-clase-impuesto";

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
  EMPTY: {
    id: 0,
    dyn_code: "",
    description: "",
    tax_class: "",
    type: "",
    status: true,
  },
};
