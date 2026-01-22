import { type ModelComplete } from "@/core/core.interface";
import { ModelsVnResource } from "./modelsVn.interface";

const ROUTE = "modelos-vn";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const MODELS_VN: ModelComplete<ModelsVnResource> = {
  MODEL: {
    name: "Modelo VN",
    plural: "Modelos VN",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/modelsVn",
  QUERY_KEY: "modelsVn",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

const ROUTE_POSTVENTA = "modelos-vn-pv";
const ABSOLUTE_ROUTE_POSTVENTA = `/ap/post-venta/taller/${ROUTE_POSTVENTA}`;

export const MODELS_VN_POSTVENTA: ModelComplete<ModelsVnResource> = {
  MODEL: {
    name: "Modelo VN",
    plural: "Modelos VN",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/modelsVn",
  QUERY_KEY: "modelsVn",
  ROUTE: ROUTE_POSTVENTA,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_POSTVENTA,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_POSTVENTA}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_POSTVENTA}/actualizar`,
};

// RUTA PARA REPUESTOS - MODELOS VN
const ROUTE_REPUESTOS = "modelos-vn-repuestos";
const ABSOLUTE_ROUTE_REPUESTOS = `/ap/post-venta/repuestos/${ROUTE_REPUESTOS}`;

export const MODELS_VN_REPUESTOS: ModelComplete<ModelsVnResource> = {
  MODEL: {
    name: "Modelo VN",
    plural: "Modelos VN",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/modelsVn",
  QUERY_KEY: "modelsVn-repuestos",
  ROUTE: ROUTE_REPUESTOS,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_REPUESTOS,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_REPUESTOS}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_REPUESTOS}/actualizar`,
};
