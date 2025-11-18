import { type ModelComplete } from "@/core/core.interface";
import { ShopResource } from "./shop.interface";

const ROUTE = "tiendas";
const ABSOLUTE_ROUTE = `/ap/configuraciones/ventas/${ROUTE}`;

export const SHOP: ModelComplete<ShopResource> = {
  MODEL: {
    name: "Tienda",
    plural: "Tiendas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/shop",
  QUERY_KEY: "shop",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
    sedes: [],
  },
};
