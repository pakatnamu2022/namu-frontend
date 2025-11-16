import { type ModelComplete } from "@/core/core.interface";
import { AssignCompanyBranchResource } from "./assignCompanyBranch.interface";

const ROUTE = "asignar-sede";

export const ASSIGN_COMPANY_BRANCH: ModelComplete<AssignCompanyBranchResource> =
  {
    MODEL: {
      name: "Asignar Sede",
      plural: "Asignar Sedes",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/configuration/assignCompanyBranch",
    QUERY_KEY: "assignCompanyBranch",
    ROUTE,
    ROUTE_ADD: `${ROUTE}/agregar`,
    ROUTE_UPDATE: `${ROUTE}/actualizar`,
    EMPTY: {
      sede_id: 0,
      year: 0,
      month: 0,
      assigned_workers: [],
    },
  };
