import { type ModelComplete } from "@/core/core.interface";
import { CommercialManagerBrandGroupResource } from "./commercialManagerBrandGroup.interface";

const ROUTE = "asignar-grupo-marca";
const ABSOLUTE_ROUTE = `/ap/configuraciones/ventas/${ROUTE}`;

export const COMMERCIAL_MANAGER_BRAND_GROUP: ModelComplete<CommercialManagerBrandGroupResource> =
  {
    MODEL: {
      name: "Asignar Jefe de Ventas",
      plural: "Asignar Jefes de Ventas",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/configuration/commercialManagerBrandGroup",
    QUERY_KEY: "commercialManagerBrandGroup",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `./agregar`,
    ROUTE_UPDATE: `./actualizar`,
    EMPTY: {
      year: 0,
      month: 0,
      brand_group_id: 0,
      commercial_managers: [],
    },
  };
