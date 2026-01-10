import { type ModelComplete } from "@/core/core.interface";
import { TypeGenderResource } from "./typesGender.interface";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants";

const ROUTE = "tipos-sexo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const TYPE_GENDER: ModelComplete<TypeGenderResource> = {
  MODEL: {
    name: "Tipo Sexo",
    plural: "Tipos Sexo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "typeGender",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
