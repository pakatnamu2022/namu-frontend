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
}