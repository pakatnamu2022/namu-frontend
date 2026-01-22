import { ModelComplete } from "@/core/core.interface.ts";
import { ReceptionResource } from "./receptionsProducts.interface.ts";

const ROUTE = "recepcion";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-de-compras/factura-compra/${ROUTE}`;

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
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const RECEPTION_TYPES = [
  { value: "ORDERED", label: "Ordenado" },
  { value: "BONUS", label: "Bonificación" },
  { value: "GIFT", label: "Regalo" },
  { value: "SAMPLE", label: "Muestra" },
] as const;
