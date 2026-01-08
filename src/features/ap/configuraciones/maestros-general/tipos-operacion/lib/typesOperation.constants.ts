import { type ModelComplete } from "@/core/core.interface";
import { TypesOperationResource } from "./typesOperation.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "tipos-operacion-cita";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const TYPES_OPERATION: ModelComplete<TypesOperationResource> = {
  MODEL: {
    name: "Tipo de Operación",
    plural: "Tipos de Operaciones",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "typesOperation",
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

export const TYPES_OPERATION_ID = {
  COMERCIAL: "794",
  POSTVENTA: "804",
};
