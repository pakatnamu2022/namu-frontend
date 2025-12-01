import { type ModelComplete } from "@/core/core.interface.ts";
import { POSTVENTA_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants.ts";
import { TypesOperationsAppointmentResource } from "./typesOperationsAppointment.interface.ts";

const ROUTE = "tipos-operacion-cita";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const TYPE_OPERACTION_APPOINTMENT: ModelComplete<TypesOperationsAppointmentResource> =
  {
    MODEL: {
      name: "Tipo de Operación",
      plural: "Tipos de Operación",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: POSTVENTA_MASTERS_ENDPOINT,
    QUERY_KEY: "TypesOperationsAppointment",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
    EMPTY: {
      id: 0,
      code: "",
      description: "",
      type: "",
      status: true,
    },
  };
