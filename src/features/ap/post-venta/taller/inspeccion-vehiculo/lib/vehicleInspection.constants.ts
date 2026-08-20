import { type ModelComplete } from "@/core/core.interface.ts";
import { VehicleInspectionResource } from "./vehicleInspection.interface";

const ROUTE = "inspeccion-vehiculo";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/orden-trabajo`;

export const VEHICLE_INSPECTION: ModelComplete<VehicleInspectionResource> = {
  MODEL: {
    name: "Recepción de Vehículo",
    plural: "Inspecciones de Vehículos",
    gender: true,
  },
  ICON: "ClipboardCheck",
  ENDPOINT: "/ap/postVenta/vehicleInspections",
  QUERY_KEY: "vehicleInspections",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/:workOrderId/inspeccion`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/:workOrderId/inspeccion`,
};

export const CHECKLIST_ITEMS = [
  { key: "dirty_unit", label: "Unidad sucia", category: "estado" },
  { key: "unit_ok", label: "Unidad en buen estado", category: "estado" },
  { key: "title_deed", label: "Título de propiedad", category: "documentos" },
  { key: "soat", label: "SOAT", category: "documentos" },
  { key: "moon_permits", label: "Permisos de lunas", category: "documentos" },
  { key: "service_card", label: "Carnet de servicio", category: "documentos" },
  {
    key: "owner_manual",
    label: "Manual del propietario",
    category: "accesorios",
  },
  { key: "key_ring", label: "Llavero", category: "accesorios" },
  { key: "wheel_lock", label: "Seguro de ruedas", category: "accesorios" },
  { key: "safe_glasses", label: "Seguro de vasos", category: "accesorios" },
  { key: "radio_mask", label: "Máscara de radio", category: "accesorios" },
  { key: "lighter", label: "Encendedor", category: "accesorios" },
  { key: "floors", label: "Pisos", category: "accesorios" },
  { key: "seat_cover", label: "Funda Asiento", category: "accesorios" },
  { key: "quills", label: "Plumillas", category: "accesorios" },
  { key: "antenna", label: "Antena", category: "accesorios" },
  { key: "glasses_wheel", label: "Vasos Rueda", category: "accesorios" },
  { key: "emblems", label: "Emblemas", category: "accesorios" },
  { key: "spare_tire", label: "Llanta Repuesto", category: "herramientas" },
  { key: "fluid_caps", label: "Tapas Fluido", category: "herramientas" },
  { key: "tool_kit", label: "Kit Herramientas", category: "herramientas" },
  { key: "jack_and_lever", label: "Gata y Palanca", category: "herramientas" },
] as const;

// Niveles de combustible
export const fuelLevels = [
  { label: "0 (0%)", value: "0" },
  { label: "1/4 (25%)", value: "1/4" },
  { label: "2/4 (50%)", value: "2/4" },
  { label: "3/4 (75%)", value: "3/4" },
  { label: "4/4 (100%)", value: "4/4" },
];

//Niveles de Aceite
export const oilLevels = [
  { label: "0 (0%)", value: "0" },
  { label: "1/4 (25%)", value: "1/4" },
  { label: "2/4 (50%)", value: "2/4" },
  { label: "3/4 (75%)", value: "3/4" },
  { label: "4/4 (100%)", value: "4/4" },
];

export const workDetailFields = [
  "oil_change",
  "check_level_lights",
  "general_lubrication",
  "rotation_inspection_cleaning",
  "insp_filter_basic_checks",
  "tire_pressure_inflation_check",
  "alignment_balancing",
  "pad_replace_disc_resurface",
] as const;

export const resultExplanationFields = [
  "explanation_work_performed",
  "price_explanation",
  "confirm_additional_work",
  "clarification_customer_concerns",
  "exterior_cleaning",
  "interior_cleaning",
  "keeps_spare_parts",
  "valuable_objects",
] as const;
