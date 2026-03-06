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
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
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
    worker_id: 0,
    income_sector_id: 0,
    sede_id: 0,
    vehicle_brand_id: 0,
    document_type_id: 0,
    area_id: 0,
    created_at: "",
    district: "",
    status_num_doc: "",
    client_id: 0,
    use: "",
    document_type: "",
    income_sector: "",
    sede: "",
    vehicle_brand: "",
  },
};

export const STATUS_OPTIONS = [
  { value: "all", label: "Todos Estado" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "VALIDADO", label: "Validado" },
  { value: "ERRADO", label: "Errado" },
  { value: "NO_ENCONTRADO", label: "No Encontrado" },
];

export const CONDITION_OPTIONS = [
  { value: "all", label: "Todos Condición" },
  { value: "0", label: "Subido" },
  { value: "1", label: "Atendido" },
  { value: "2", label: "Descartado" },
];
