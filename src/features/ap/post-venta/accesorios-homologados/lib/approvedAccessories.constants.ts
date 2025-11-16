import { ModelComplete } from "@/src/core/core.interface";
import { ApprovedAccesoriesResource } from "./approvedAccessories.interface";

const ROUTE = "accesorios-homologados";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    type: "",
    description: "",
    price: 0,
    status: true,
    type_currency_id: "",
    body_type_id: "",
  },
};
