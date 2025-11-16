import { type ModelComplete } from "@/core/core.interface";
import { ShopResource } from "./shop.interface";

const ROUTE = "tiendas";

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
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
    sedes: [],
  },
};
