import { type ModelComplete } from "@/core/core.interface";
import { TelephonePlanRequest } from "./telephonePlan.interface";

const ROUTE = "planes-telefonicos";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const TELEPHONE_PLAN: ModelComplete<TelephonePlanRequest> = {
  MODEL: {
    name: "Plan telefónico",
    plural: "Planes telefónicos",
    gender: true,
  },
  ICON: "PhoneCall",
  ENDPOINT: "/gp/tics/telephonePlan",
  QUERY_KEY: "telephonePlan",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    name: "",
    price: 0,
    description: "",
  },
};
