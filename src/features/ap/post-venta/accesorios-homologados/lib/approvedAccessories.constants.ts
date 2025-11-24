import { type ModelComplete } from "@/core/core.interface";
import { ApprovedAccesoriesResource } from "./approvedAccessories.interface";

const ROUTE = "accesorios-homologados";
const ABSOLUTE_ROUTE = `/ap/post-venta/${ROUTE}`;

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
    type: "",
    description: "",
    price: 0,
    status: true,
    type_currency_id: "",
    body_type_id: "",
  },
};
