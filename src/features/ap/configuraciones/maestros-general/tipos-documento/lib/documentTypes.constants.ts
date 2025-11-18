import { type ModelComplete } from "@/core/core.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";
import { DocumentTypeResource } from "./documentTypes.interface";

const ROUTE = "tipos-documento";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
