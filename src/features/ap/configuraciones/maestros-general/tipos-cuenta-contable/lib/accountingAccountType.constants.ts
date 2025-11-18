import { type ModelComplete } from "@/core/core.interface";
import { AccountingAccountTypeResource } from "./accountingAccountType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-cuenta-contable";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const ACCOUNTING_ACCOUNT_TYPE: ModelComplete<AccountingAccountTypeResource> =
  {
    MODEL: {
      name: "Tipo cuenta contable",
      plural: "Tipos cuenta contable",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
    QUERY_KEY: "accountingAccountType",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
    EMPTY: {
      id: 0,
      description: "",
      type: "",
      status: true,
    },
  };
