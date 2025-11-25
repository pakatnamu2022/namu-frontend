import { type ModelComplete } from "@/core/core.interface";
import { ApSafeCreditGoalResource } from "./apSafeCreditGoal.interface";
import { currentMonth, currentYear } from "@/core/core.function";

const ROUTE = "metas-credito-seguro";
const ABSOLUTE_ROUTE = `/ap/configuraciones/ventas/${ROUTE}`;

export const AP_SAFE_CREDIT_GOAL: ModelComplete<ApSafeCreditGoalResource> = {
  MODEL: {
    name: "Meta de Crédito Seguro",
    plural: "Metas de Crédito Seguro",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/apSafeCreditGoal",
  QUERY_KEY: "apSafeCreditGoal",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    year: currentYear(),
    month: currentMonth(),
    goal_amount: 0,
    type: "",
    sede_id: "",
  },
};
