import { type ModelComplete } from "@/core/core.interface.ts";
import { ApprovedAccesoriesResource } from "./approvedAccessories.interface.ts";

const ROUTE = "accesorios-homologados";
const ABSOLUTE_ROUTE = `/ap/post-venta/repuestos/${ROUTE}`;

export const APPROVED_ACCESSORIES: ModelComplete<ApprovedAccesoriesResource> = {
  MODEL: {
    name: "Accesorio Homologado",
    plural: "Accesorios Homologados",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/approvedAccessories",
  QUERY_KEY: "approvedAccessories",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    type_operation_id: 0,
    type_operation: "",
    description: "",
    status: true,
    type_currency_id: 0,
    prices: [],
    body_type_ids: [],
  },
};
