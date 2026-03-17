import { type ModelComplete } from "@/core/core.interface";
import { ApBankResource } from "./apBank.interface";

const ROUTE = "chequeras";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const CHECKBOOKS_ID = {
  CIX_IZIPAY_PEN_ID: 187,
  CIX_IZIPAY_USD: 188,
};
