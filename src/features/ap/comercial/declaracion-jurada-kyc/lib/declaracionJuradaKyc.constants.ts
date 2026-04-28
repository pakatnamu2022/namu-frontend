import { type ModelComplete } from "@/core/core.interface";
import { CustomerKycDeclarationResource } from "./declaracionJuradaKyc.interface";

const ROUTE = "declaraciones-juradas";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const DECLARACION_JURADA_KYC: ModelComplete<CustomerKycDeclarationResource> =
  {
    MODEL: {
      name: "Declaración Jurada KYC",
      plural: "Declaraciones Juradas KYC",
      gender: true,
    },
    ICON: "FileCheck",
    ENDPOINT: "/ap/commercial/customerKycDeclarations",
    QUERY_KEY: "customerKycDeclarations",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  };

export const KYC_STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  GENERADO: "Generado",
  FIRMADO: "Firmado",
};

export const KYC_STATUS_OPTIONS = [
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Generado", value: "GENERADO" },
  { label: "Firmado", value: "FIRMADO" },
];

export const PEP_STATUS_OPTIONS = [
  { label: "Soy PEP", value: "SI_SOY" },
  { label: "He sido PEP", value: "SI_HE_SIDO" },
  { label: "No soy PEP", value: "NO_SOY" },
  { label: "No he sido PEP", value: "NO_HE_SIDO" },
];

export const IS_PEP_RELATIVE_OPTIONS = [
  { label: "Soy pariente de PEP", value: "SI_SOY" },
  { label: "No soy pariente de PEP", value: "NO_SOY" },
];

export const THIRD_PEP_STATUS_OPTIONS = [
  { label: "Es PEP", value: "SI_ES" },
  { label: "Ha sido PEP", value: "SI_HA_SIDO" },
  { label: "No es PEP", value: "NO_ES" },
  { label: "No ha sido PEP", value: "NO_HA_SIDO" },
];

export const BENEFICIARY_TYPE_OPTIONS = [
  { label: "Propio", value: "PROPIO" },
  { label: "Tercero Natural", value: "TERCERO_NATURAL" },
  { label: "Persona Jurídica", value: "PERSONA_JURIDICA" },
  { label: "Ente Jurídico", value: "ENTE_JURIDICO" },
];

export const THIRD_REPRESENTATION_TYPE_OPTIONS = [
  { label: "Escritura Pública", value: "ESCRITURA_PUBLICA" },
  { label: "Mandato", value: "MANDATO" },
  { label: "Poder", value: "PODER" },
  { label: "Otros", value: "OTROS" },
];

export const ENTITY_REPRESENTATION_TYPE_OPTIONS = [
  { label: "Poder por Acta", value: "PODER_POR_ACTA" },
  { label: "Escritura Pública", value: "ESCRITURA_PUBLICA" },
  { label: "Mandato", value: "MANDATO" },
];

export const PEP_IS_ACTIVE = (status: string) =>
  status === "SI_SOY" || status === "SI_HE_SIDO";
