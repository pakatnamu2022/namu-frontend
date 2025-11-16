import { ModelComplete } from "@/src/core/core.interface";
import { CurrencyTypesResource } from "./CurrencyTypes.interface";

const ROUTE = "tipos-moneda";

export const CURRENCY_TYPES: ModelComplete<CurrencyTypesResource> = {
  MODEL: {
    name: "Tipo Moneda",
    plural: "Tipos Moneda",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/typeCurrency",
  QUERY_KEY: "typeCurrency",
  ROUTE,
  EMPTY: { id: 0, code: "", name: "", symbol: "", status: true },
};
