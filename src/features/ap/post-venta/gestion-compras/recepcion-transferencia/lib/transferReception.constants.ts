import { ModelComplete } from "@/core/core.interface";
import { TransferReceptionResource } from "./transferReception.interface";

const ROUTE = "recepcion";
const ABSOLUTE_ROUTE = "/ap/post-venta/gestion-de-compras/transferencia-producto";

export const TRANSFER_RECEPTION: ModelComplete<TransferReceptionResource> = {
  MODEL: {
    name: "Recepción de Transferencia",
    plural: "Recepciones de Transferencia",
    gender: false,
  },
  ICON: "PackageCheck",
  ENDPOINT: "/ap/postVenta/transferReceptions",
  QUERY_KEY: "transfer-receptions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/${ROUTE}/actualizar`,
};

export const RECEPTION_TYPES = [
  { value: "ORDERED", label: "Ordenado" },
  { value: "BONUS", label: "Bonificación" },
  { value: "GIFT", label: "Regalo" },
  { value: "SAMPLE", label: "Muestra" },
] as const;

export const OBSERVATION_REASONS = [
  { value: "DAMAGED", label: "Dañado" },
  { value: "DEFECTIVE", label: "Defectuoso" },
  { value: "EXPIRED", label: "Vencido" },
  { value: "WRONG_PRODUCT", label: "Producto Incorrecto" },
  { value: "WRONG_QUANTITY", label: "Cantidad Incorrecta" },
  { value: "POOR_QUALITY", label: "Mala Calidad" },
  { value: "OTHER", label: "Otro" },
] as const;

export const RECEPTION_TYPE_COLORS = {
  ORDERED: "bg-blue-100 text-blue-800",
  BONUS: "bg-green-100 text-green-800",
  GIFT: "bg-purple-100 text-purple-800",
  SAMPLE: "bg-orange-100 text-orange-800",
} as const;

export const OBSERVATION_REASON_COLORS = {
  DAMAGED: "bg-red-100 text-red-800",
  DEFECTIVE: "bg-orange-100 text-orange-800",
  EXPIRED: "bg-red-100 text-red-800",
  WRONG_PRODUCT: "bg-yellow-100 text-yellow-800",
  WRONG_QUANTITY: "bg-yellow-100 text-yellow-800",
  POOR_QUALITY: "bg-orange-100 text-orange-800",
  OTHER: "bg-gray-100 text-gray-800",
} as const;

// Estados de recepción
export const RECEPTION_STATUS_OPTIONS = [
  { value: "APPROVED", label: "Aprobado" },
  { value: "PARTIAL", label: "Parcial" },
  { value: "INCOMPLETE", label: "Incompleto" },
] as const;

// Tipos de recepción (completa/parcial)
export const RECEPTION_TYPE_OPTIONS = [
  { value: "COMPLETE", label: "Completa" },
  { value: "PARTIAL", label: "Parcial" },
] as const;

/**
 * Traducciones para reception_type (tipo de producto recibido)
 */
export function translateReceptionType(type?: string | null): string {
  const translations: Record<string, string> = {
    ORDERED: "Ordenado",
    BONUS: "Bonificación",
    GIFT: "Regalo",
    SAMPLE: "Muestra",
  };
  return type ? translations[type] ?? type : "-";
}

/**
 * Traducciones para reason_observation
 */
export function translateReasonObservation(reason?: string | null): string {
  const translations: Record<string, string> = {
    DAMAGED: "Dañado",
    DEFECTIVE: "Defectuoso",
    EXPIRED: "Vencido",
    WRONG_PRODUCT: "Producto Incorrecto",
    WRONG_QUANTITY: "Cantidad Incorrecta",
    POOR_QUALITY: "Mala Calidad",
    OTHER: "Otro",
  };
  return reason ? translations[reason] ?? reason : "-";
}

/**
 * Traducciones para status
 */
export function translateStatus(status?: string | null): string {
  const translations: Record<string, string> = {
    APPROVED: "Aprobado",
    PARTIAL: "Parcial",
    INCOMPLETE: "Incompleto",
  };
  return status ? translations[status] ?? status : "-";
}

/**
 * Traducciones para reception type (completa/parcial)
 */
export function translateReceptionTypeStatus(type?: string | null): string {
  const translations: Record<string, string> = {
    COMPLETE: "Completa",
    PARTIAL: "Parcial",
  };
  return type ? translations[type] ?? type : "-";
}
