import { type ModelComplete } from "@/core/core.interface";
import { PhoneLineRequest } from "./phoneLine.interface";

const ROUTE = "lineas-telefonicas";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const PHONE_LINE: ModelComplete<PhoneLineRequest> = {
  MODEL: {
    name: "Línea telefónica",
    plural: "Líneas telefónicas",
    gender: true,
  },
  ICON: "Phone",
  ENDPOINT: "/gp/tics/phoneLine",
  QUERY_KEY: "phoneLine",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    telephone_account_id: "",
    telephone_plan_id: "",
    line_number: "",
    status: "active",
    is_active: true,
  },
};
