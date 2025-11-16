import { ModelComplete } from "@/core/core.interface";
import { AccountingAccountPlanResource } from "./accountingAccountPlan.interface";

const ROUTE = "plan-cuenta-contable";

export const ACCOUNTING_ACCOUNT_PLAN: ModelComplete<AccountingAccountPlanResource> =
  {
    MODEL: {
      name: "Plan de Cuenta Contable",
      plural: "Planes de Cuenta Contable",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/configuration/accountingAccountPlan",
    QUERY_KEY: "accountingAccountPlan",
    ROUTE,
    EMPTY: {
      id: 0,
      account: "",
      code_dynamics: "",
      description: "",
      accounting_type_id: 0,
      status: true,
    },
  };
