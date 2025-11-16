import { ModelComplete } from "@/src/core/core.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/src/features/ap/lib/ap.constants";
import { DocumentTypeResource } from "./documentTypes.interface";

const ROUTE = "tipos-documento";

export const DOCUMENT_TYPE: ModelComplete<DocumentTypeResource> = {
  MODEL: {
    name: "Tipo de documento",
    plural: "Tipos de documento",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "documentType",
  ROUTE,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
