import { type ModelComplete } from "@/core/core.interface";
import { GearShiftTypeResource } from "./gearShiftType.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "transmision-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const TYPE_TRANSMISSION: ModelComplete<GearShiftTypeResource> = {
  MODEL: {
    name: "Transmisión vehículo",
    plural: "Transmisiones vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "typeTransmission",
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
