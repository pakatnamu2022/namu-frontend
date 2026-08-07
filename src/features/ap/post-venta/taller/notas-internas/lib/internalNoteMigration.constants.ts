import { type ModelComplete } from "@/core/core.interface.ts";
import { InternalNoteMigrationResource } from "./internalNoteMigration.interface";

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
