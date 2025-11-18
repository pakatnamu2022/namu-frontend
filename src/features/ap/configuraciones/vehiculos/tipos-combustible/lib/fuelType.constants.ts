import { type ModelComplete } from "@/core/core.interface";
import { FuelTypeResource } from "./fuelType.interface";

const ROUTE = "tipos-combustible";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const FUEL_TYPE: ModelComplete<FuelTypeResource> = {
  MODEL: {
    name: "Tipo de combustible",
    plural: "Tipos de combustible",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/fuelType",
  QUERY_KEY: "fuelType",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    electric_motor: true,
    status: true,
  },
};
