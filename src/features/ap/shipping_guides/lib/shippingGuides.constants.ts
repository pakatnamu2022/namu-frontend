import { ModelComplete } from "@/core/core.interface";
import { ShippingGuidesResource } from "./shippingGuides.interface";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { BadgeColor } from "@/components/ui/badge";

const ROUTE = "envios-recepciones";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const SHIPPING_GUIDES: ModelComplete<ShippingGuidesResource> = {
  MODEL: {
    name: "Guía de Remisión",
    plural: "Guías de Remisión y Traslado",
    gender: true,
  },
  ICON: "Package",
  ENDPOINT: "/ap/commercial/shippingGuides",
  QUERY_KEY: "shipments-receptions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// Tipos de documento
export const DOCUMENT_TYPES = [
  { value: "GUIA_REMISION", label: "Guía de Remisión" },
  { value: "GUIA_TRASLADO", label: "Guía Interna de Traslado" },
];

// Tipos de emisor
export const ISSUER_TYPES = [
  { value: "SYSTEM", label: "Automotores" },
  { value: "PROVEEDOR", label: "Proveedor" },
];

const SUNAT_WAITING_HOURS = 5;

export type SunatStatusKey = "accepted" | "rejected" | "waiting" | "not_sent";

export const SUNAT_STATUS: Record<
  SunatStatusKey,
  { label: string; color: BadgeColor; icon: LucideIcon }
> = {
  accepted:  { label: "Aceptado",  color: "green",       icon: CheckCircle2 },
  waiting:   { label: "En espera", color: "blue",         icon: CheckCircle2 },
  rejected:  { label: "Rechazado", color: "destructive",  icon: XCircle },
  not_sent:  { label: "No enviado", color: "gray",        icon: XCircle },
};

export const SUNAT_STATUS_TOOLTIP_ITEMS = [
  { label: "Aceptado por SUNAT",           indicator: "bg-green-600" },
  { label: "En espera de respuesta",       indicator: "bg-primary" },
  { label: "Rechazado (>5h sin respuesta)", indicator: "bg-destructive" },
  { label: "No enviado",                   indicator: "bg-gray-400" },
];

export function resolveSunatStatus(
  sentAt: string | null | undefined,
  aceptadaPorSunat: boolean | null | undefined,
): SunatStatusKey {
  if (!sentAt) return "not_sent";
  const hoursDiff = (Date.now() - new Date(sentAt).getTime()) / (1000 * 60 * 60);
  if (aceptadaPorSunat === true) return "accepted";
  if (aceptadaPorSunat === false && hoursDiff > SUNAT_WAITING_HOURS) return "rejected";
  return "waiting";
}

// Estados de migración a BD intermedia
export type MigrationStatusKey = "pending" | "in_progress" | "completed" | "failed";

export const MIGRATION_STATUS: Record<
  MigrationStatusKey,
  { label: string; color: BadgeColor; icon: LucideIcon }
> = {
  pending:     { label: "Pendiente",   color: "yellow", icon: Clock },
  in_progress: { label: "En Proceso",  color: "blue",   icon: Loader2 },
  completed:   { label: "Completado",  color: "green",  icon: CheckCircle2 },
  failed:      { label: "Fallido",     color: "red",    icon: XCircle },
};
