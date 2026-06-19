import { type ModelComplete } from "@/core/core.interface";
import { ScrumItemRequest } from "./scrumItem.interface";

const ROUTE = "pm/items";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const SCRUM_ITEM: ModelComplete<ScrumItemRequest> = {
  MODEL: {
    name: "Item",
    plural: "Items",
    gender: true,
  },
  ICON: "SquareCheckBig",
  ENDPOINT: "/gp/tics/pm/scrumItem",
  QUERY_KEY: "scrumItem",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    project_id: 0,
    sprint_id: null,
    parent_id: null,
    type: "tarea",
    title: "",
    description: "",
    status: "backlog",
    priority: "media",
    assigned_to: null,
    story_points: null,
    estimated_hours: null,
    actual_hours: null,
    due_date: null,
    tag_ids: [],
  },
};
