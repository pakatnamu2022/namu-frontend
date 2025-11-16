import { ModelComplete } from "@/core/core.interface";
import { TypeGenderResource } from "./typesGender.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-sexo";

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
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
