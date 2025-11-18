import { type ModelComplete } from "@/core/core.interface";
import { UserSeriesAssignmentResource } from "./userSeriesAssignment.interface";

const ROUTE = "asignar-serie-usuario";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const USER_SERIES_ASSIGNMENT: ModelComplete<UserSeriesAssignmentResource> =
  {
    MODEL: {
      name: "Asignar Serie a Usuario",
      plural: "Asignar Series a Usuarios",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/configuration/userSeriesAssignment",
    QUERY_KEY: "userSeriesAssignment",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
    EMPTY: {
      worker_id: "",
      vouchers: [],
    },
  };
