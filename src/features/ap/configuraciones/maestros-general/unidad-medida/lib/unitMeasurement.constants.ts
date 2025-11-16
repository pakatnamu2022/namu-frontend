import { ModelComplete } from "@/core/core.interface";
import { UnitMeasurementResource } from "./unitMeasurement.interface";

const ROUTE = "unidad-medida";

export const UNIT_MEASUREMENT: ModelComplete<UnitMeasurementResource> = {
  MODEL: {
    name: "Unidad de Medida",
    plural: "Unidades de Medida",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/unitMeasurement",
  QUERY_KEY: "unitMeasurement",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    dyn_code: "",
    nubefac_code: "",
    description: "",
    status: true,
  },
};

export const UNIT_MEASUREMENT_ID = {
  BIDON: 1,
  BALDE: 2,
  BOLSA: 3,
  CAJA: 4,
  GALON: 5,
  KILO: 6,
  LITRO: 7,
  SERVICIO: 8,
  UNIDAD: 9,
};
