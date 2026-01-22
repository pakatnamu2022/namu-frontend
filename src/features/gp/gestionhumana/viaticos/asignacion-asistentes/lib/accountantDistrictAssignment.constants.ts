import { type ModelComplete } from "@/core/core.interface.ts";
import { AccountantDistrictAssignmentResource } from "./accountantDistrictAssignment.interface";

const ROUTE = "asignacion-asistentes";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/viaticos/${ROUTE}`;

export const ACCOUNTANT_DISTRICT_ASSIGNMENT: ModelComplete<AccountantDistrictAssignmentResource> =
  {
    MODEL: {
      name: "Asignación de Asistente",
      plural: "Asignaciones de Asistentes",
      gender: true,
    },
    ICON: "UserCheck",
    ENDPOINT: "/gp/gh/accountant-district-assignments",
    QUERY_KEY: "accountantDistrictAssignment",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
    EMPTY: {
      id: 0,
      worker: {
        id: 0,
        name: "",
        document: "",
        sede: "",
        position: "",
        offerLetterConfirmationId: 0,
        emailOfferLetterStatusId: 0,
        offerLetterConfirmation: "",
        emailOfferLetterStatus: "",
        photo: "",
      },
      district: {
        id: 0,
        name: "",
        ubigeo: "",
        province_id: 0,
        department_id: 0,
      },
      created_at: "",
      updated_at: "",
    },
  };
