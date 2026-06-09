import { type ModelComplete } from "@/core/core.interface";
import { FoodCardResource } from "./food-card.interface";

const ROUTE = "tarjeta-de-alimentos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const FOOD_CARD: ModelComplete<FoodCardResource> = {
  MODEL: {
    name: "Tarjeta de Alimentos",
    plural: "Tarjetas de Alimentos",
    gender: false,
  },
  ICON: "CreditCard",
  ENDPOINT: "/gp/gh/payroll/food-cards",
  QUERY_KEY: "food-cards",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/asignar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/asignar`,
};
