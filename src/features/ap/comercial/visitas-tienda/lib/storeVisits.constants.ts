import { type ModelComplete } from "@/core/core.interface";
import { StoreVisitsResource } from "./storeVisits.interface";

const ROUTE = "visitas-tienda";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const STORE_VISITS: ModelComplete<StoreVisitsResource> = {
  MODEL: {
    name: "Visita a Tienda",
    plural: "Visitas a Tienda",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/potentialBuyers",
  QUERY_KEY: "storeVisits",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    registration_date: "",
    model: "",
    version: "",
    num_doc: "",
    full_name: "",
    phone: "",
    email: "",
    campaign: "",
    type: "",
    worker_id: "",
    income_sector_id: "",
    sede_id: "",
    vehicle_brand_id: "",
    document_type_id: "",
    area_id: "",
  },
};
