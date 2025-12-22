import { type ModelComplete } from "@/core/core.interface";
import { PerDiemRateResource } from "./perDiemRate.interface";

const ROUTE = "tarifa";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/viaticos/${ROUTE}`;

export const PER_DIEM_RATE: ModelComplete<PerDiemRateResource> = {
  MODEL: {
    name: "Tarifa de viático",
    plural: "Tarifas de viático",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "gp/gestion-humana/viaticos/PerDiemRate",
  QUERY_KEY: "perDiemRates",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
