import { type ModelComplete } from "@/core/core.interface";
import { SupplierOrderTypeResource } from "./supplierOrderType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "tipos-pedido-proveedor";

export const SUPPLIER_ORDER_TYPE: ModelComplete<SupplierOrderTypeResource> = {
  MODEL: {
    name: "Tipo de Pedido Proveedor",
    plural: "Tipos de Pedido Proveedor",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "supplierOrderType",
  ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
