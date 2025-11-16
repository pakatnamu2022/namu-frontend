import { ModelComplete } from "@/src/core/core.interface";
import { BankResource } from "./bank.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "bancos";

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
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
