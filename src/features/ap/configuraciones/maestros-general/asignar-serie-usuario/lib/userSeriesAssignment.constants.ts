import { ModelComplete } from "@/src/core/core.interface";
import { UserSeriesAssignmentResource } from "./userSeriesAssignment.interface";

const ROUTE = "asignar-serie-usuario";

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
    ROUTE_ADD: `${ROUTE}/agregar`,
    ROUTE_UPDATE: `${ROUTE}/actualizar`,
    EMPTY: {
      worker_id: "",
      vouchers: [],
    },
  };
