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

// RUTA PARA CAJA - POST VENTA
const ROUTE_CAJA = "comprobante-venta-caja";
const ABSOLUTE_ROUTE_CAJA = `/ap/post-venta/caja/${ROUTE_CAJA}`;
export const ELECTRONIC_DOCUMENT_CAJA: ModelComplete<ElectronicDocumentResource> =
  {
    MODEL: {
      name: "Comprobante de Venta Caja",
      plural: "Comprobantes de Venta Caja",
      gender: false,
    },
    ICON: "FileText",
    ENDPOINT: "/ap/facturacion/electronic-documents",
    QUERY_KEY: "electronic-documents-caja",
    ROUTE: ROUTE_CAJA,
    ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_CAJA,
    ROUTE_ADD: `${ABSOLUTE_ROUTE_CAJA}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE_CAJA}/actualizar`,
  };

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
