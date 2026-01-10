import { type ModelComplete } from "@/core/core.interface";
import { SupplierOrderTypeResource } from "./supplierOrderType.interface";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants";

const ROUTE = "tipos-pedido-proveedor";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const SUPPLIER_ORDER_TYPE: ModelComplete<SupplierOrderTypeResource> = {
  MODEL: {
    name: "Tipo de Pedido Proveedor",
    plural: "Tipos de Pedido Proveedor",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "supplierOrderType",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
