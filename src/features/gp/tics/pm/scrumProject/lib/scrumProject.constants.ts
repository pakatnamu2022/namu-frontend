import { type ModelComplete } from "@/core/core.interface";
import { ScrumProjectRequest } from "./scrumProject.interface";

const ROUTE = "pm/proyectos";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const SCRUM_PROJECT: ModelComplete<ScrumProjectRequest> = {
  MODEL: {
    name: "Proyecto",
    plural: "Proyectos",
    gender: true,
  },
  ICON: "FolderKanban",
  ENDPOINT: "/gp/tics/pm/scrumProject",
  QUERY_KEY: "scrumProject",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    name: "",
    description: "",
    color: "#3B82F6",
    status: "activo",
  },
};
