import { type ModelComplete } from "@/core/core.interface.ts";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";

const ROUTE = "aseguradora";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const INSURER: ModelComplete<SuppliersResource> = {
  MODEL: {
    name: "Aseguradora",
    plural: "Aseguradoras",
    gender: true,
  },
  ICON: "ShieldCheck",
  ENDPOINT: "/ap/commercial/businessPartners",
  QUERY_KEY: "insurers",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
