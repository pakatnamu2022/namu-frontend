import { ModelComplete } from "@/core/core.interface";
import { EquipmentTypeResource } from "./equipmentType.interface";

const ROUTE = "tipos-de-equipo";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const EQUIPMENT_TYPE: ModelComplete<EquipmentTypeResource> = {
  MODEL: {
    name: "Tipo de Equipo",
    plural: "Tipos de Equipo",
    gender: false,
  },
  ROUTE,
  ABSOLUTE_ROUTE,
  ENDPOINT: "/gp/tics/equipmentType",
  ICON: "Monitor",
  QUERY_KEY: "equipmentType",
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    name: "",
  },
};
