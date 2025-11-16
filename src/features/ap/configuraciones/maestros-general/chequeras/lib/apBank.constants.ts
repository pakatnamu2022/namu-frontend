import { ModelComplete } from "@/src/core/core.interface";
import { ApBankResource } from "./apBank.interface";

const ROUTE = "chequeras";

export const BANK_AP: ModelComplete<ApBankResource> = {
  MODEL: {
    name: "Chequera",
    plural: "Chequeras",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/bankAp",
  QUERY_KEY: "bankAp",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
