import { type ModelComplete } from "@/core/core.interface";
import { ElectronicDocumentResource } from "./electronicDocument.interface";

// RUTAS PARA COMERCIAL
const ROUTE = "comprobantes-venta";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const ELECTRONIC_DOCUMENT: ModelComplete<ElectronicDocumentResource> = {
  MODEL: {
    name: "Documento Electrónico",
    plural: "Documentos Electrónicos",
    gender: false,
  },
  ICON: "FileText",
  ENDPOINT: "/ap/facturacion/electronic-documents",
  QUERY_KEY: "electronic-documents",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// RUTA PARA REPUESTOS - POST VENTA
const ROUTE_REPUESTOS = "comprobante-venta-repuesto";
const ABSOLUTE_ROUTE_REPUESTOS = `/ap/post-venta/repuestos/${ROUTE_REPUESTOS}`;

export const ELECTRONIC_DOCUMENT_REPUESTOS: ModelComplete<ElectronicDocumentResource> =
  {
    MODEL: {
      name: "Comprobante de Venta Repuesto",
      plural: "Comprobantes de Venta Repuestos",
      gender: false,
    },
    ICON: "FileText",
    ENDPOINT: "/ap/facturacion/electronic-documents",
    QUERY_KEY: "electronic-documents-repuestos",
    ROUTE: ROUTE_REPUESTOS,
    ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_REPUESTOS,
    ROUTE_ADD: `${ABSOLUTE_ROUTE_REPUESTOS}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE_REPUESTOS}/actualizar`,
  };

// RUTA PARA TALLER - POST VENTA
const ROUTE_TALLER = "comprobante-venta-taller";
const ABSOLUTE_ROUTE_TALLER = `/ap/post-venta/taller/${ROUTE_TALLER}`;
export const ELECTRONIC_DOCUMENT_TALLER: ModelComplete<ElectronicDocumentResource> =
  {
    MODEL: {
      name: "Comprobante de Venta Taller",
      plural: "Comprobantes de Venta Taller",
      gender: false,
    },
    ICON: "FileText",
    ENDPOINT: "/ap/facturacion/electronic-documents",
    QUERY_KEY: "electronic-documents-taller",
    ROUTE: ROUTE_TALLER,
    ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_TALLER,
    ROUTE_ADD: `${ABSOLUTE_ROUTE_TALLER}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE_TALLER}/actualizar`,
  };

export const DOCUMENT_MODIFIED_TYPES = [
  { value: 1, label: "Factura" },
  { value: 2, label: "Boleta" },
];

export const PERCEPTION_TYPES = [
  { value: 1, label: "Percepción Venta Interna" },
  { value: 2, label: "Percepción a la Adquisición de Combustible" },
  { value: 3, label: "Percepción Realizada al Agente de Percepción" },
];

export const RETENTION_TYPES = [
  { value: 1, label: "Retención" },
  { value: 2, label: "Retención de Segunda Categoría" },
];

export const DETRACTION_PAYMENT_METHODS = [
  { value: 1, label: "Depósito en cuenta" },
  { value: 2, label: "Giro" },
  { value: 3, label: "Transferencia de fondos" },
  { value: 4, label: "Orden de pago" },
  { value: 5, label: "Tarjeta de débito" },
  { value: 6, label: "Tarjeta de crédito" },
  { value: 7, label: "Cheques con la cláusula de «no negociable»" },
  { value: 8, label: "Efectivo" },
  { value: 9, label: "Otros medios de pago" },
  {
    value: 10,
    label: "Tarjeta de crédito emitida en el país o en el exterior",
  },
  { value: 11, label: "Tarjeta de débito emitida en el país o en el exterior" },
  {
    value: 12,
    label:
      "Tarjeta de débito emitida en el país o en el exterior por empresas del sistema financiero",
  },
];

export const GUIDE_TYPES = [
  { value: 1, label: "Guía de Remisión - Remitente" },
  { value: 2, label: "Guía de Remisión - Transportista" },
];

export const DOCUMENT_STATUS = [
  { value: "draft", label: "Borrador", color: "bg-gray-500" },
  { value: "sent", label: "Enviado", color: "bg-blue-500" },
  { value: "accepted", label: "Aceptado", color: "bg-green-500" },
  { value: "rejected", label: "Rechazado", color: "bg-red-500" },
  { value: "cancelled", label: "Anulado", color: "bg-orange-500" },
];

export const UNIT_MEASURES = [
  { value: "NIU", label: "NIU - Unidad (Bienes)" },
  { value: "ZZ", label: "ZZ - Unidad (Servicios)" },
  { value: "KGM", label: "KGM - Kilogramo" },
  { value: "LTR", label: "LTR - Litro" },
  { value: "MTR", label: "MTR - Metro" },
  { value: "SET", label: "SET - Juego" },
  { value: "DAY", label: "DAY - Día" },
  { value: "HUR", label: "HUR - Hora" },
];

export const DEFAULT_IGV_PERCENTAGE = 18;
export const DEFAULT_SERIE_LENGTH = 4;

// Account Plan IDs para items de cotización
export const QUOTATION_ACCOUNT_PLAN_IDS = {
  ADVANCE_PAYMENT: "2", // Para anticipos
  FULL_SALE: "6", // Para venta total
} as const;

export const NUBEFACT_CODES = {
  GRAVADA_ONEROSA: "1",
  EXONERADA_ONEROSA: "8",
  INAFECTA_ONEROSA: "9",
  GRATUITA: "17",
};