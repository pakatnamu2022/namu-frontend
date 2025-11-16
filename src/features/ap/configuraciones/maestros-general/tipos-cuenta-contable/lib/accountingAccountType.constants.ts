import { ModelComplete } from "@/src/core/core.interface";
import { AccountingAccountTypeResource } from "./accountingAccountType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-cuenta-contable";

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
    EMPTY: {
      id: 0,
      description: "",
      type: "",
      status: true,
    },
  };
