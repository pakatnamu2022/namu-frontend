import type { MonthOption } from "./core.interface";

export const ACTIONS_NAMES: Record<string, string> = {
  create: "cread",
  update: "actualizad",
  delete: "eliminad",
  fetch: "obtenid",
  close: "cerrad",
};

export const MONTHS: MonthOption[] = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export const DEFAULT_PER_PAGE = 10;

export const STATUS_ACTIVE = 1;

export const STATUS_INACTIVE = 0;

export const LEGAL_AGE = 18;

export const ACTIONS: Record<string, string> = {
  create: "crear",
  update: "actualizar",
  delete: "eliminar",
  fetch: "obtener",
  close: "cerrar",
  manage: "gestionar",
};

export const EMPRESA_TP = {
  id: 1,
  href: "https://transportespakatnamu.com/",
  label: "TP",
  src: "/logos/tplogo.svg",
  scrWhite: "/logos/tplogowhite.svg",
  image: "/images/modules/transportes.webp",
};
export const EMPRESA_DP = {
  id: 2,
  href: "https://www.depositopakatnamu.com.pe/",
  label: "DP",
  src: "/logos/dplogo.svg",
  scrWhite: "/logos/dplogowhite.svg",
  image: "/images/modules/deposito.webp",
};
export const EMPRESA_AP = {
  id: 3,
  href: "https://automotorespakatnamu.com/",
  label: "AP",
  src: "/logos/aplogo.svg",
  scrWhite: "/logos/aplogowhite.svg",
  image: "/images/modules/automotores.webp",
};
export const EMPRESA_GP = {
  id: 4,
  href: "https://grupopakatnamu.com/",
  label: "GP",
  src: "/logos/gplogo.svg",
  scrWhite: "/logos/gplogowhite.svg",
  image: "/images/modules/grupo.webp",
};

export const CONSTANTS: any = {
  // LOGO: "/logos/millagp.svg",
  // LOGO_ICON: "/logos/millagplogo.svg",
  LOGO: "/logos/sian.svg",
  LOGO_WHITE: "/logos/sianwhite.svg",
  LOGO_ICON: "/logos/sianlogo.svg",
  EMPRESAS: [EMPRESA_AP, EMPRESA_DP, EMPRESA_GP, EMPRESA_TP],
};

export const AP_CHECKLIST = {
  ENTREGA: "ENTREGA",
  RECEPCION: "RECEPCION",
};

export const IGV = {
  RATE: 0.18,
  FACTOR: 1.18,
};

export const BUSINESS_PARTNERS = {
  MARITAL_STATUS_ID: "700",
  TYPE_PERSON_NATURAL_ID: "704",
  TYPE_PERSON_JURIDICA_ID: "705",
  TYPE_DOCUMENT_DNI_ID: "809",
  TYPE_DOCUMENT_RUC_ID: "810",
  TYPE_DOCUMENT_LICENSE_ID: "811",
  PERSON_SEGMENT_DEFAULT_ID: "823",
  TYPE_TAX_CLASS_DEFAULT_ID: "4",
  ACTIVITY_ECONOMIC_DEFAULT_ID: "793",
};

export const TYPE_BUSINESS_PARTNERS = {
  CLIENTE: "CLIENTE",
  PROVEEDOR: "PROVEEDOR",
  AMBOS: "AMBOS",
};

export const VALIDATABLE_DOCUMENT = {
  IDS: [
    BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID,
    BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID,
    BUSINESS_PARTNERS.TYPE_DOCUMENT_LICENSE_ID, // Si tienes este ID
  ],
  TYPE_MAP: {
    [BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID]: "dni",
    [BUSINESS_PARTNERS.TYPE_DOCUMENT_RUC_ID]: "ruc",
    [BUSINESS_PARTNERS.TYPE_DOCUMENT_LICENSE_ID]: "license", // Si existe
  },
};

export const TIPO_LEADS = {
  VISITA: "VISITA",
  LEADS: "LEADS",
};

export const INCOME_SECTOR = {
  SHOWROOM_ID: "827",
  TALLER_ID: "828",
  SITIO_WEB_ID: "829",
};

// Commercial Module ID Constants
export const CM_COMERCIAL_ID = 794;
export const CM_POSTVENTA_ID = 804;
