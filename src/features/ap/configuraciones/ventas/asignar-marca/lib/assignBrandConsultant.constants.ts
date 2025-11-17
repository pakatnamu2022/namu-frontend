import { type ModelComplete } from "@/core/core.interface";
import { AssignBrandConsultantResource } from "./assignBrandConsultant.interface";

const ROUTE = "asignar-marca";
const ABSOLUTE_ROUTE = `/ap/configuraciones/ventas/${ROUTE}`;

export const ASSIGN_BRAND_CONSULTANT: ModelComplete<AssignBrandConsultantResource> =
  {
    MODEL: {
      name: "Asignar Marca a Asesor",
      plural: "Asignar Marcas a Asesores",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/configuration/assignBrandConsultant",
    QUERY_KEY: "assignBrandConsultant",
    ROUTE,
    ABSOLUTE_ROUTE,
    EMPTY: {
      id: 0,
      year: 0,
      month: 0,
      company_branch_id: 0,
      sede_id: 0,
      brand_id: 0,
      worker_id: 0,
      status: false,
      sales_target: 0,
    },
  };
