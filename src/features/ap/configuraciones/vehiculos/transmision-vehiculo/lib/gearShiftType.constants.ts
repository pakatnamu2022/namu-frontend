import { type ModelComplete } from "@/core/core.interface";
import { GearShiftTypeResource } from "./gearShiftType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "transmision-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const TYPE_TRANSMISSION: ModelComplete<GearShiftTypeResource> = {
  MODEL: {
    name: "Transmisión vehículo",
    plural: "Transmisiones vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "typeTransmission",
  ROUTE,
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
