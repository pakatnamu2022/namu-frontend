import { type ModelComplete } from "@/core/core.interface";
import { ControlTravelSchema } from "../lib/travelControl.schema";

const ROUTE = "control-viajes";
const ABSOLUTE_ROUTE = `/tp/comercial-tp/${ROUTE}`;

export const TRAVEL_CONTROL: ModelComplete<ControlTravelSchema> = {
  MODEL: {
    name: "Travel",
    plural: "Travels",
    gender: false,
  },
  ICON: "EqualNot",
  ENDPOINT: "/tp/comercial/control-travel",
  QUERY_KEY: "ControlTravel",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
};
