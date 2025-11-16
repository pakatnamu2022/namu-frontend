import { ModelComplete } from "@/src/core/core.interface";
import { FuelTypeResource } from "./fuelType.interface";

const ROUTE = "tipos-combustible";

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
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    electric_motor: true,
    status: true,
  },
};
