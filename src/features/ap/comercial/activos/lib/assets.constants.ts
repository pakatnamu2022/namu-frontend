import { type ModelComplete } from "@/core/core.interface";
import { AssetResource } from "./assets.interface";

const ROUTE = "activos";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const ASSETS: ModelComplete<AssetResource> = {
  MODEL: {
    name: "Activo",
    plural: "Activos",
    gender: false,
  },
  ICON: "Car",
  ENDPOINT: "/ap/commercial/assets",
  QUERY_KEY: "assets",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// Estados de migración a Dynamics
export const MIGRATION_STATUS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En Proceso" },
  { value: "completed", label: "Completado" },
  { value: "failed", label: "Fallido" },
  { value: "skipped", label: "Omitido" },
] as const;
