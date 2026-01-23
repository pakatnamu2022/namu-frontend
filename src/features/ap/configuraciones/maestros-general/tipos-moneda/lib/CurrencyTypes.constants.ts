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
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    name: "",
    symbol: "",
    status: true,
    enable_commercial: false,
    enable_after_sales: false,
  },
};

export const CURRENCY_TYPE_IDS = {
  DOLLARS: "1",
  EURO: "2",
  SOLES: "3",
};
