import { type ModelComplete } from "@/core/core.interface";
import { DistrictResource } from "./district.interface";

const ROUTE = "ubigeos";

export const DISTRICT: ModelComplete<DistrictResource> = {
  MODEL: {
    name: "Ubigeo",
    plural: "Ubigeos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gs/district",
  QUERY_KEY: "district",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    name: "",
    ubigeo: "",
    province_id: 0,
    department_id: 0,
  },
};
