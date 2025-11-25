import { type ModelComplete } from "@/core/core.interface";
import { ApGoalSellOutInResource } from "./apGoalSellOutIn.interface";

const ROUTE = "metas-venta";
const ABSOLUTE_ROUTE = `/ap/configuraciones/ventas/${ROUTE}`;

export const AP_GOAL_SELL_OUT_IN: ModelComplete<ApGoalSellOutInResource> = {
  MODEL: {
    name: "Meta de Venta",
    plural: "Metas de Venta",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/apGoalSellOutIn",
  QUERY_KEY: "apGoalSellOutIn",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    year: 0,
    month: 0,
    goal: 0,
    brand_id: 0,
    shop_id: 0,
    type: "",
  },
};
