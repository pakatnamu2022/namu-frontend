import { type ModelComplete } from "@/core/core.interface.ts";
import { HotelAgreementResource } from "./hotelAgreement.interface";

const ROUTE = "convenios-hoteles";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/viaticos/${ROUTE}`;

export const HOTEL_AGREEMENT: ModelComplete<HotelAgreementResource> = {
  MODEL: {
    name: "Convenio de Hotel",
    plural: "Convenios de Hoteles",
    gender: false,
  },
  ICON: "Building2",
  ENDPOINT: "gp/gestion-humana/viaticos/hotel-agreements",
  QUERY_KEY: "hotelAgreement",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
