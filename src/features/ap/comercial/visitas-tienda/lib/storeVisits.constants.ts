import { type ModelComplete } from "@/core/core.interface";
import { StoreVisitsResource } from "./storeVisits.interface";

const ROUTE = "visitas-tienda";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
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
