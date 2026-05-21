import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type PersonType = "NATURAL" | "JURIDICA";
export type KycStatus = "PENDIENTE" | "GENERADO" | "FIRMADO";
export type LegalReviewStatus = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";
export type PepStatus = "SI_SOY" | "SI_HE_SIDO" | "NO_SOY" | "NO_HE_SIDO";
export type IsPepRelative = "SI_SOY" | "NO_SOY";
export type ThirdPepStatus = "SI_ES" | "SI_HA_SIDO" | "NO_ES" | "NO_HA_SIDO";
export type BeneficiaryType =
  | "PROPIO"
  | "TERCERO_NATURAL"
  | "PERSONA_JURIDICA"
  | "ENTE_JURIDICO";
export type ThirdRepresentationType =
  | "ESCRITURA_PUBLICA"
  | "MANDATO"
  | "PODER"
  | "OTROS";
export type EntityRepresentationType =
  | "PODER_POR_ACTA"
  | "ESCRITURA_PUBLICA"
  | "MANDATO";

export interface PepRelativeData {
  pep_full_name: string;
  relationship: string;
}

export interface CustomerKycDeclarationResource {
  id: number;
  purchase_request_quote_id: number | null;
  purchase_request_quote?: string;
  business_partner_id: number;
  sede_id: number;
  person_type: PersonType;
  status: KycStatus;

  full_name: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  num_doc: string;
  document_type: string;
  document_type_id: number;
  nationality: string;
  marital_status: string;
  marital_status_id: number;
  spouse_full_name: string | null;
  direction: string;
  district: string;
  province: string;
  department: string;
  phone: string;
  email: string;

  occupation: string | null;
  fixed_phone: string | null;
  purpose_relationship: string | null;

  pep_status: PepStatus;
  pep_collaborator_status: PepStatus;
  pep_position: string | null;
  pep_institution: string | null;
  pep_relatives: string[];
  pep_spouse_name: string | null;

  is_pep_relative: IsPepRelative;
  pep_relative_data: PepRelativeData[];

  beneficiary_type: BeneficiaryType;
  own_funds_origin: string | null;

  third_full_name: string | null;
  third_doc_type: string | null;
  third_doc_number: string | null;
  third_representation_type: ThirdRepresentationType | null;
  third_pep_status: ThirdPepStatus | null;
  third_pep_position: string | null;
  third_pep_institution: string | null;
  third_funds_origin: string | null;

  entity_name: string | null;
  entity_ruc: string | null;
  entity_representation_type: EntityRepresentationType | null;
  entity_funds_origin: string | null;
  entity_final_beneficiary: string | null;

  declaration_date: string;
  signed_file_path: string | null;

  legal_review_status: LegalReviewStatus | null;
  legal_review_comments: string | null;
  reviewed_by: string | null;
  legal_review_at: string | null;

  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface LegalReviewRejectRequest {
  comments: string;
}

export interface LegalReviewConfirmRequest {
  comments?: string;
}

export type CustomerKycDeclarationItem =
  | CustomerKycDeclarationResource
  | CustomerKycDeclarationLegal;

export interface CustomerKycDeclarationResponse {
  data: CustomerKycDeclarationItem[];
  links: Links;
  meta: Meta;
}

export interface CustomerKycDeclarationRequest {
  purchase_request_quote_id?: number;
  business_partner_id: string;
  sede_id: string;
  occupation?: string;
  fixed_phone?: string;
  purpose_relationship?: string;

  pep_status: PepStatus;
  pep_collaborator_status: PepStatus;
  pep_position?: string;
  pep_institution?: string;
  pep_relatives?: string[];
  pep_spouse_name?: string;

  is_pep_relative: IsPepRelative;
  pep_relative_data?: PepRelativeData[];

  beneficiary_type: BeneficiaryType;
  own_funds_origin?: string;

  third_full_name?: string;
  third_doc_type?: string;
  third_doc_number?: string;
  third_representation_type?: ThirdRepresentationType;
  third_pep_status?: ThirdPepStatus;
  third_pep_position?: string;
  third_pep_institution?: string;
  third_funds_origin?: string;

  entity_name?: string;
  entity_ruc?: string;
  entity_representation_type?: EntityRepresentationType;
  entity_funds_origin?: string;
  entity_final_beneficiary?: string;

  declaration_date: string | Date;
  status?: KycStatus;
}

export interface getCustomerKycDeclarationProps {
  params?: Record<string, any>;
}

export interface CustomerKycDeclarationLegal {
  id: number;
  purchase_request_quote_id: number | null;
  purchase_request_quote: string | null;
  business_partner_id: number;
  sede_id: number;
  person_type: "JURIDICA";
  status: KycStatus;
  // Snapshot BP
  bp_company_name: string | null;
  bp_ruc: string | null;
  bp_email: string | null;
  bp_phone: string | null;
  // Campos 1-5
  company_name: string | null;
  ruc: string | null;
  foreign_registry_number: string | null;
  business_purpose: string | null;
  final_beneficiaries: string | null;
  purpose_relationship: string | null;
  // Campo 6 — Representante
  rep_full_name: string | null;
  rep_doc_type: "DNI" | "PASAPORTE" | "CARNE_EXTRANJERIA" | "OTRO" | null;
  rep_doc_number: string | null;
  rep_doc_other: string | null;
  rep_representation_type: "PODER" | "MANDATO" | null;
  rep_instrument_type:
    | "ESCRITURA_PUBLICA"
    | "COPIA_CERTIFICADA_ACTA"
    | "OTROS"
    | null;
  rep_escritura_date: string | null;
  rep_notary_name: string | null;
  rep_acta_certified_date: string | null;
  rep_acta_date: string | null;
  rep_instrument_other: string | null;
  rep_registry_partition: string | null;
  rep_registry_seat: string | null;
  rep_registry_section: string | null;
  rep_registry_zone: string | null;
  // Campo 7 — Dirección oficina
  office_street_type: "JR" | "AV" | "CALLE" | "PASAJE" | "OVALO" | null;
  office_street_name: string | null;
  office_number: string | null;
  office_int_number: string | null;
  office_urbanization: string | null;
  office_district_id: number | null;
  office_district: string | null;
  office_province: string | null;
  office_department: string | null;
  office_phone: string | null;
  // Campo 8 — Beneficiario
  beneficiary_type: BeneficiaryType;
  own_funds_origin: string | null;
  third_full_name: string | null;
  third_doc_type: string | null;
  third_doc_number: string | null;
  third_representation_type: "PODER_ESCRITURA_PUBLICA" | "MANDATO" | null;
  third_pep_status: ThirdPepStatus | null;
  third_pep_position: string | null;
  third_pep_institution: string | null;
  third_funds_origin: string | null;
  entity_name: string | null;
  entity_ruc: string | null;
  entity_representation_type: EntityRepresentationType | null;
  entity_funds_origin: string | null;
  entity_final_beneficiary: string | null;
  // Campo 9
  account_number: string | null;
  // Review
  declaration_date: string;
  signed_file_path: string | null;
  legal_review_status: LegalReviewStatus | null;
  legal_review_comments: string | null;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  legal_review_at: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}
