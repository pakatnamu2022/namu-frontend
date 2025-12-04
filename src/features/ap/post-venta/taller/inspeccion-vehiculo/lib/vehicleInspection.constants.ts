import { type ModelComplete } from "@/core/core.interface.ts";
import { VehicleInspectionResource } from "./vehicleInspection.interface";

const ROUTE = "inspeccion-vehiculo";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/orden-trabajo`;

export const VEHICLE_INSPECTION: ModelComplete<VehicleInspectionResource> = {
  MODEL: {
    name: "Inspección de Vehículo",
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
  { key: "owner_manual", label: "Manual del propietario", category: "accesorios" },
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
