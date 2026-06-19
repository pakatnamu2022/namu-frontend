import { type ModelComplete } from "@/core/core.interface";
import { ScrumTagRequest } from "./scrumTag.interface";

const ROUTE = "pm/etiquetas";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const SCRUM_TAG: ModelComplete<ScrumTagRequest> = {
  MODEL: {
    name: "Etiqueta",
    plural: "Etiquetas",
    gender: false,
  },
  ICON: "Tag",
  ENDPOINT: "/gp/tics/pm/scrumTag",
  QUERY_KEY: "scrumTag",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    name: "",
    color: "#3B82F6",
    project_id: undefined,
  },
};
