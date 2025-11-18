import { type ModelComplete } from "@/core/core.interface";
import { BankResource } from "./bank.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "bancos";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const BANK: ModelComplete<BankResource> = {
  MODEL: {
    name: "Banco",
    plural: "Bancos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "bank",
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
