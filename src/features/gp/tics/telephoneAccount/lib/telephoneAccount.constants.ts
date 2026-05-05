import { type ModelComplete } from "@/core/core.interface";
import { TelephoneAccountRequest } from "./telephoneAccount.interface";

const ROUTE = "cuentas-telefonicas";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const TELEPHONE_ACCOUNT: ModelComplete<TelephoneAccountRequest> = {
  MODEL: {
    name: "Cuenta telefónica",
    plural: "Cuentas telefónicas",
    gender: true,
  },
  ICON: "CreditCard",
  ENDPOINT: "/gp/tics/telephoneAccount",
  QUERY_KEY: "telephoneAccount",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    company_id: 0,
    account_number: "",
    operator: "",
  },
};
