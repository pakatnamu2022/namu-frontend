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

// Monto mínimo de retención en Soles (S/ 700)
export const MIN_RETENTION = 700;
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

// Categoría de total en la que debe sumar un item según su code_nubefact.
// Fuente única de verdad para el cálculo de totales (gravada/exonerada/inafecta/gratuita).
// Escalable: para soportar un nuevo tratamiento (ej. otro código de gratuita),
// basta con agregarlo aquí sin tocar la lógica de sumatoria.
export type IgvCategory = "gravada" | "exonerada" | "inafecta" | "gratuita";

export function getIgvCategory(codeNubefact?: string): IgvCategory | null {
  if (!codeNubefact) return null;
  if (codeNubefact === NUBEFACT_CODES.GRAVADA_ONEROSA) return "gravada";
  if (codeNubefact === NUBEFACT_CODES.EXONERADA_ONEROSA) return "exonerada";
  if (codeNubefact === NUBEFACT_CODES.INAFECTA_ONEROSA) return "inafecta";
  if (codeNubefact === NUBEFACT_CODES.GRATUITA) return "gratuita";
  return null;
}

// Solo el tratamiento "gravada" cobra IGV; el resto (inafecta/exonerada/gratuita) va con igv=0.
export function igvTypeChargesIgv(codeNubefact?: string): boolean {
  return codeNubefact === NUBEFACT_CODES.GRAVADA_ONEROSA;
}

// Modo de operación del comprobante a nivel de documento (elegido por Caja),
// que determina qué sunat_concept_igv_type_id se asigna a los items nuevos.
export type IgvMode = "normal" | "inafecta" | "gratuita";

// Código Nubefact de tipo de IGV asociado a cada modo de documento.
export const IGV_MODE_CODES: Record<IgvMode, string> = {
  normal: NUBEFACT_CODES.GRAVADA_ONEROSA,
  inafecta: NUBEFACT_CODES.INAFECTA_ONEROSA,
  gratuita: NUBEFACT_CODES.GRATUITA,
};

export const PAYMENT_CONDITIONS = [
  { label: "CONTADO", value: "contado" },
  { label: "CREDITO", value: "credito" },
] as const;

export type PaymentConditionValue =
  (typeof PAYMENT_CONDITIONS)[number]["value"];

export const PAYMENT_CONDITION_CREDIT: PaymentConditionValue = "credito";

export const CREDIT_DAYS_OPTIONS = [
  { label: "1 día", value: "1" },
  { label: "3 días", value: "3" },
  { label: "7 días", value: "7" },
  { label: "15 días", value: "15" },
  { label: "30 días", value: "30" },
  { label: "45 días", value: "45" },
] as const;

// BILLING_DOCUMENT_TYPE - tipo_de_comprobante de Nubefact
export const NUBEFACT_DOCUMENT_TYPES: Record<string, string> = {
  "1": "Factura Electrónica",
  "2": "Boleta de Venta Electrónica",
  "3": "Nota de Crédito Electrónica",
  "4": "Nota de Débito Electrónica",
};

export function getNubefactDocumentTypeLabel(value?: string | number): string {
  if (value === undefined || value === null) return "-";
  return NUBEFACT_DOCUMENT_TYPES[String(value)] || String(value);
}

// BILLING_DETRACTION_TYPE - detraccion_tipo de Nubefact
export const NUBEFACT_DETRACTION_TYPES: Record<string, string> = {
  "1": "001 Azúcar y melaza de caña",
  "2": "002  Arroz",
  "3": "003  Alcohol etílico",
  "4": "004  Recursos Hidrobiológicos",
  "5": "005  Maíz amarillo duro",
  "7": "007  Caña de azúcar",
  "8": "008  Madera",
  "9": "009  Arena y piedra.",
  "10": "010 Residuos, subproductos, desechos, recortes y desperdicios",
  "11": "011 Bienes gravados con el IGV, o renuncia a la exoneración",
  "12": "012 Intermediación laboral y tercerización",
  "13": "014 Carnes y despojos comestibles",
  "14": "016 Aceite de pescado",
  "15": "017 Harina, polvo y “pellets” de pescado, crustáceos, moluscos y demás invertebrados acuáticos",
  "17": "019 Arrendamiento de bienes muebles",
  "18": "020 Mantenimiento y reparación de bienes muebles",
  "19": "021 Movimiento de carga",
  "20": "022 Otros servicios empresariales",
  "21": "023 Leche",
  "22": "024 Comisión mercantil",
  "23": "025 Fabricación de bienes por encargo",
  "24": "026 Servicio de transporte de personas",
  "25": "027 Servicio de transporte de carga",
  "26": "028  Transporte de pasajeros",
  "28": "030 Contratos de construcción",
  "29": "031 Oro gravado con el IGV",
  "30": "032 Paprika y otros frutos de los generos capsicum o pimienta",
  "32": "034 Minerales metálicos no auríferos",
  "33": "035 Bienes exonerados del IGV",
  "34": "036 Oro y demás minerales metálicos exonerados del IGV",
  "35": "037 Demás servicios gravados con el IGV",
  "37": "039 Minerales no metálicos",
  "38": "040 Bien inmueble gravado con IGV",
  "39": "041 Plomo",
  "40": "013 ANIMALES VIVOS",
  "41": "015 ABONOS, CUEROS Y PIELES DE ORIGEN ANIMAL",
  "42": "099 LEY 30737",
};

export function getNubefactDetractionTypeLabel(
  value?: string | number | null,
): string {
  if (value === undefined || value === null || value === "") return "-";
  return NUBEFACT_DETRACTION_TYPES[String(value)] || String(value);
}

// BILLING_CURRENCY - moneda de Nubefact
export const NUBEFACT_CURRENCIES: Record<string, string> = {
  "1": "Soles",
  "2": "Dólares Americanos",
  "3": "Euros",
  "4": "Libras Esterlinas",
};

export function getNubefactCurrencyLabel(value?: string | number): string {
  if (value === undefined || value === null) return "-";
  return NUBEFACT_CURRENCIES[String(value)] || String(value);
}
