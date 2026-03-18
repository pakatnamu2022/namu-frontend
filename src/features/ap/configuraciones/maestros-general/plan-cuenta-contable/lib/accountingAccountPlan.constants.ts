import { type ModelComplete } from "@/core/core.interface";
import { AccountingAccountPlanResource } from "./accountingAccountPlan.interface";

const ROUTE = "plan-cuenta-contable";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

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
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
    EMPTY: {
      id: 0,
      account: "",
      code_dynamics: "",
      description: "",
      accounting_type_id: 0,
      status: true,
      is_detraction: false,
    },
  };

export const ACP_TYPE_SALE = 0;
export const ACP_TYPE_CREDIT_NOTE = 1;
export const ACP_TYPE_DEBIT_NOTE = 2;
