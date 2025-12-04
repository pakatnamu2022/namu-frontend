import { ModelComplete } from "@/core/core.interface";
import { ReceptionResource } from "./receptionsProducts.interface";

const ROUTE = "recepcion";
const ABSOLUTE_ROUTE =
  "/ap/post-venta/gestion-de-compras/orden-compra-producto";

export const RECEPTION: ModelComplete<ReceptionResource> = {
  MODEL: {
    name: "Recepción de Productos",
    plural: "Recepciones de Productos",
    gender: false,
  },
  ICON: "PackageCheck",
  ENDPOINT: "/ap/postVenta/purchaseReceptions",
  QUERY_KEY: "purchase-receptions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/${ROUTE}/actualizar`,
};

export const RECEPTION_TYPES = [
  { value: "ORDERED", label: "Ordenado" },
  { value: "BONUS", label: "Bonificación" },
  { value: "GIFT", label: "Regalo" },
  { value: "SAMPLE", label: "Muestra" },
] as const;
