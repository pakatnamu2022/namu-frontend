import { type ModelComplete } from "@/core/core.interface";
import { CurrencyTypesResource } from "./CurrencyTypes.interface";

const ROUTE = "tipos-moneda";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  EMPTY: { id: 0, code: "", name: "", symbol: "", status: true },
};
