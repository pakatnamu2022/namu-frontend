import { type ModelComplete } from "@/core/core.interface.ts";
import { InternalNoteMigrationResource } from "./internalNoteMigration.interface";

// Estados de migración de nota interna
export const MIGRATION_STATUS = {
  completed: "Completado",
  failed: "Fallido",
  pending: "Pendiente",
} as const;

export type MigrationStatus = keyof typeof MIGRATION_STATUS;

export const MIGRATION_STATUS_COLOR: Record<
  MigrationStatus,
  "green" | "red" | "yellow"
> = {
  completed: "green",
  failed: "red",
  pending: "yellow",
};

// RUTAS PARA MIGRACIONES DE NOTAS INTERNAS - TALLER
const ROUTE = "notas-internas";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const INTERNAL_NOTE_MIGRATION: ModelComplete<InternalNoteMigrationResource> =
  {
    MODEL: {
      name: "Nota Interna",
      plural: "Notas Internas",
      gender: true,
    },
    ICON: "StickyNote",
    ENDPOINT: "/ap/postVenta/internalNotes",
    QUERY_KEY: "internalNotesMigration",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: ABSOLUTE_ROUTE,
    ROUTE_UPDATE: ABSOLUTE_ROUTE,
  };
