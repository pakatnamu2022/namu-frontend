import { type ModelComplete } from "@/core/core.interface";
import { BankResource } from "./bank.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "bancos";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const BANK: ModelComplete<BankResource> = {
  MODEL: {
    name: "Banco",
    plural: "Bancos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "bank",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
