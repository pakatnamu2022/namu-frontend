import { type ModelComplete } from "@/core/core.interface";
import { AssignmentLeadershipResource } from "./assignmentLeadership.interface";

const ROUTE = "asignar-jefe";

export const ASSIGNMENT_LEADERSHIP: ModelComplete<AssignmentLeadershipResource> =
  {
    MODEL: {
      name: "Asignar Jefe de Ventas",
      plural: "Asignar Jefes de Ventas",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/configuration/assignmentLeadership",
    QUERY_KEY: "assignmentLeadership",
    ROUTE,
    ROUTE_UPDATE: `./actualizar`,
    ROUTE_ADD: `./agregar`,
    EMPTY: {
      year: 0,
      month: 0,
      boss_id: 0,
      assigned_workers: [],
      status: true,
    },
  };
