import { ModelComplete } from "@/src/core/core.interface";
import { MaritalStatusResource } from "./maritalStatus.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "origen-cliente";

export const MARITAL_STATUS: ModelComplete<MaritalStatusResource> = {
  MODEL: {
    name: "Estado Civil",
    plural: "Estados Civiles",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "maritalStatus",
  ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
