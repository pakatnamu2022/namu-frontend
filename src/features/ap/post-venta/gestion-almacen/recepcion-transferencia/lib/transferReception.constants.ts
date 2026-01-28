import { ModelComplete } from "@/core/core.interface.ts";
import { TransferReceptionResource } from "./transferReception.interface.ts";

const ROUTE = "recepcion";
const ABSOLUTE_ROUTE =
  "/ap/post-venta/gestion-de-almacen/transferencia-producto";

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
  return type ? (translations[type] ?? type) : "-";
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
  return reason ? (translations[reason] ?? reason) : "-";
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
  return status ? (translations[status] ?? status) : "-";
}

/**
 * Traducciones para reception type (completa/parcial)
 */
export function translateReceptionTypeStatus(type?: string | null): string {
  const translations: Record<string, string> = {
    COMPLETE: "Completa",
    PARTIAL: "Parcial",
  };
  return type ? (translations[type] ?? type) : "-";
}
