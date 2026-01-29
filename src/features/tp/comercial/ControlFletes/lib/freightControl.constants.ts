import { type ModelComplete } from "@/core/core.interface";
import { FreightControlResource } from "./freightControl.interface";


const ROUTE = "control-fletes";
const ABSOLUTE_ROUTE = `/tp/comercial-tp/${ROUTE}`;


export const FREIGHTCONTROL: ModelComplete<FreightControlResource> = {
  MODEL: {
    name: "fletes",
    plural: "fletes",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/tp/comercial/freight/control-freight",
  QUERY_KEY: "ControlFreight",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
}