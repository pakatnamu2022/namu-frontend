import { type Links, type Meta } from "@/shared/lib/pagination.interface";

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
  business_partner_id: number;
  sede_id: number;
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

export interface CustomerKycDeclarationResponse {
  data: CustomerKycDeclarationResource[];
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
