import { type ModelComplete } from "@/core/core.interface.ts";
import { BusinessPartnersResource } from "./businessPartners.interface.ts";

// RUTA PARA AP-MASTER - SOCIOS COMERCIALES
const ROUTE = "socios-comerciales";
const ABSOLUTE_ROUTE = `/ap/ap-master/${ROUTE}`;

export const BUSINESS_PARTNERS_MASTER: ModelComplete<BusinessPartnersResource> = {
  MODEL: {
    name: "Socio Comercial",
    plural: "Socios Comerciales",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartners",
  QUERY_KEY: "business-partners",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
