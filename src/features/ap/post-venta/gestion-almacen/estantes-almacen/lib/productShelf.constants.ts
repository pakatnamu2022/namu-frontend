import { type ModelComplete } from "@/core/core.interface.ts";
import { ProductShelfResource } from "./productShelf.interface.ts";

const ROUTE = "estantes-almacen";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-de-almacen/${ROUTE}`;

export const PRODUCT_SHELF: ModelComplete<ProductShelfResource> = {
  MODEL: {
    name: "Estante",
    plural: "Estantes",
    gender: false,
  },
  ICON: "LayoutGrid",
  ENDPOINT: "/ap/postVenta/productShelves",
  QUERY_KEY: "product-shelves",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  ROUTE_DASHBOARD: `${ABSOLUTE_ROUTE}/gestionar`,
  EMPTY: {
    id: 0,
    warehouse_id: 0,
    warehouse: "",
    code: "",
    label: "",
    notes: null,
    status: true,
    created_by: null,
    creator: "",
    created_at: "",
    updated_at: "",
  },
};

export const SHELF_STATUS_OPTIONS = [
  { label: "Activo", value: "1" },
  { label: "Inactivo", value: "0" },
] as const;
