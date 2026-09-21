import { BadgeColor } from "@/components/ui/badge";
import { AuditAction, AuditCauseCode } from "./vehicle-sale-audit.interface";

export const ACTION_LABEL: Record<AuditAction, string> = {
  CORREGIR: "Corregir",
  REVISAR: "Revisar",
  "SIN ACCIÓN": "Sin acción",
};

export const ACTION_COLOR: Record<AuditAction, BadgeColor> = {
  CORREGIR: "emerald",
  REVISAR: "amber",
  "SIN ACCIÓN": "gray",
};

export const ACTION_HINT: Record<AuditAction, string> = {
  CORREGIR: "El caso es limpio: se puede corregir el dato directamente.",
  REVISAR: "Pasó algo más después; hay que mirarlo a mano antes de tocarlo.",
  "SIN ACCIÓN": "El daño ocurrió, pero el estado actual ya es el correcto.",
};

export const CAUSE_SHORT: Record<AuditCauseCode, string> = {
  LLEGADA_TARDIA: "Llegada tardía de traslado",
  NC_SOBRE_REFACTURA: "Nota de crédito sobre refacturación",
  ANULACION_SOBRE_VENTA_VIGENTE: "Anulación sobre venta vigente",
  GUIA_SOBRE_VENDIDO: "Guía sobre vehículo vendido",
  CAMBIO_SIN_MOVIMIENTO: "Cambio sin movimiento",
  SIN_CLASIFICAR: "Sin clasificar",
};

export const CAUSE_COLOR: Record<AuditCauseCode, BadgeColor> = {
  LLEGADA_TARDIA: "blue",
  NC_SOBRE_REFACTURA: "violet",
  ANULACION_SOBRE_VENTA_VIGENTE: "orange",
  GUIA_SOBRE_VENDIDO: "sky",
  CAMBIO_SIN_MOVIMIENTO: "pink",
  SIN_CLASIFICAR: "gray",
};

/** La solución de la causa figura como pendiente cuando su texto empieza por "PENDIENTE". */
export const isFixPending = (fix: string) => fix.startsWith("PENDIENTE");

/** "2026-09-09 06:00:21" → "09/09 06:00". */
export const formatDateTime = (value: string) => {
  const m = value.match(/^\d{4}-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  return m ? `${m[2]}/${m[1]} ${m[3]}:${m[4]}` : value;
};

/** "MM-DD HH:mm" (línea de tiempo) → "DD/MM HH:mm". */
export const formatTimelineDate = (value: string) => {
  const m = value.match(/^(\d{2})-(\d{2}) (\d{2}:\d{2})/);
  return m ? `${m[2]}/${m[1]} ${m[3]}` : value;
};
