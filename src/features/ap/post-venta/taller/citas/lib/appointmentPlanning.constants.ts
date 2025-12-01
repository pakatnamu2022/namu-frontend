import { type ModelComplete } from "@/core/core.interface.ts";
import { AppointmentPlanningResource } from "./appointmentPlanning.interface";

const ROUTE = "citas";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const APPOINTMENT_PLANNING: ModelComplete<AppointmentPlanningResource> =
  {
    MODEL: {
      name: "Cita",
      plural: "Citas",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/postVenta/appointmentPlanning",
    QUERY_KEY: "appointmentPlanning",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  };
