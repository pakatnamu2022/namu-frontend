import { type ModelComplete } from "@/core/core.interface";
import { ScrumSprintRequest } from "./scrumSprint.interface";

const ROUTE = "sprints";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const SCRUM_SPRINT: ModelComplete<ScrumSprintRequest> = {
  MODEL: {
    name: "Sprint",
    plural: "Sprints",
    gender: true,
  },
  ICON: "Zap",
  ENDPOINT: "/gp/tics/pm/scrumSprint",
  QUERY_KEY: "scrumSprint",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    project_id: 0,
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "planeado",
  },
};
