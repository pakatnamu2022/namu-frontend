import { type ModelComplete } from "@/core/core.interface";
import { GoalTravelControlResource } from "./GoalTravelControl.interface";

const ROUTE = "control-metas";
const ABSOLUTE_ROUTE = `/tp/comercial-tp/${ROUTE}`;

export const GOALTRAVELCONTROL: ModelComplete<GoalTravelControlResource> = {
  MODEL: {
    name: "metas",
    plural: "metas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/tp/comercial/goal/control-goal",
  QUERY_KEY: "ControlGoal",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
};
export const MONTHS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];