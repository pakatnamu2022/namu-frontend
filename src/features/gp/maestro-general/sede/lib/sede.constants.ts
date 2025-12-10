import { type ModelComplete } from "@/core/core.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";

const ROUTE = "sede";
const ABSOLUTE_ROUTE = `/gp/maestro-general/${ROUTE}`;

export const SEDE: ModelComplete<SedeResource> = {
  MODEL: {
    name: "Sede",
    plural: "Sedes",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/mg/sede",
  QUERY_KEY: "sede",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
