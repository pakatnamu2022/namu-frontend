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

// CONSTANTES DE PLANILLA
const ROUTE_PAYROLL = "parametros-planilla";
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

// COSTANTES DE POSTVENTA
const ROUTE_POST_SALE = "parametros-postventa";
const ABSOLUTE_ROUTE_POST_SALE = `/gp/postventa/${ROUTE_POST_SALE}`;

export const POST_SALE_MASTERS: ModelComplete<GeneralMastersResource> = {
  MODEL: {
    name: "Maestro de Postventa",
    plural: "Maestros de Postventa",
    gender: false,
  },
  ICON: "Settings",
  ENDPOINT: GENERAL_MASTERS_ENDPOINT,
  QUERY_KEY: "postSaleMasters",
  ROUTE: ROUTE_POST_SALE,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_POST_SALE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_POST_SALE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_POST_SALE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    value: "",
    status: 1,
  },
};

export const PAYROLL_CONSTANTS_TYPE = "SPREADSHEET_PARAMETERS";
export const AFTER_SALES_PARAMETERS_TYPE = "AFTER_SALES_PARAMETERS";
