import { type ModelComplete } from "@/core/core.interface";
import { GENERAL_MASTERS_ENDPOINT } from "@/features/gp/lib/gp.constants";
import { GeneralMastersResource } from "./generalMasters.interface";

const ROUTE = "maestros-generales";
const ABSOLUTE_ROUTE = `/gp/${ROUTE}`;

export const GENERAL_MASTERS: ModelComplete<GeneralMastersResource> = {
  MODEL: {
    name: "Maestro General",
    plural: "Maestros Generales",
    gender: false,
  },
  ICON: "Database",
  ENDPOINT: GENERAL_MASTERS_ENDPOINT,
  QUERY_KEY: "generalMasters",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    value: "",
    status: 1,
  },
};

const ROUTE_PAYROLL = "constantes";
const ABSOLUTE_ROUTE_PAYROLL = `/gp/gestionhumana/planillas/${ROUTE_PAYROLL}`;

export const PAYROLL_CONSTANTS: ModelComplete<GeneralMastersResource> = {
  MODEL: {
    name: "Constante de Planilla",
    plural: "Constantes de Planilla",
    gender: false,
  },
  ICON: "Settings",
  ENDPOINT: GENERAL_MASTERS_ENDPOINT,
  QUERY_KEY: "payrollConstants",
  ROUTE: ROUTE_PAYROLL,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_PAYROLL,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_PAYROLL}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_PAYROLL}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    value: "",
    status: 1,
  },
};
