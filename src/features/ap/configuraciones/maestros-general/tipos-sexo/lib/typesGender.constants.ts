import { type ModelComplete } from "@/core/core.interface";
import { TypeGenderResource } from "./typesGender.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-sexo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const TYPE_GENDER: ModelComplete<TypeGenderResource> = {
  MODEL: {
    name: "Tipo Sexo",
    plural: "Tipos Sexo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "typeGender",
  ROUTE,
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
