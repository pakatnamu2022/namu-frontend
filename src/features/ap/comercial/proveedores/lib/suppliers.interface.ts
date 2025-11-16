import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface SuppliersResponse {
  data: SuppliersResource[];
  links: Links;
  meta: Meta;
}

export interface SuppliersResource {
  id: number;
  first_name: string;
  middle_name: string;
  paternal_surname: string;
  maternal_surname: string;
  full_name: string;
  birth_date: null;
  nationality: string;
  num_doc: string;
  spouse_num_doc: null;
  spouse_full_name: null;
  direction: string;
  legal_representative_num_doc: null;
  legal_representative_name: null;
  legal_representative_paternal_surname: null;
  legal_representative_maternal_surname: null;
  legal_representative_full_name: null;
  email: string;
  secondary_email: null;
  phone: string;
  secondary_phone: null;
  secondary_phone_contact_name: null;
  driver_num_doc: null;
  driver_full_name: null;
  driving_license: null;
  driving_license_expiration_date: null;
  status_license: null;
  restriction: null;
  company_status: string;
  company_condition: string;
  origin_id: null;
  driving_license_category: null;
  tax_class_type_id: number;
  supplier_tax_class_id: string;
  type_person_id: string;
  district_id: string;
  document_type_id: string;
  person_segment_id: string;
  marital_status_id: null;
  gender_id: null;
  activity_economic_id: null;
  company_id: number;
  origin: null;
  supplier_tax_class_type?: string;
  tax_class_type?: string;
  type_road: null;
  type_person: string;
  district: string;
  document_type: string;
  person_segment: string;
  marital_status: null;
  gender: null;
  activity_economic: null;
  company: string;
  type: string;
}

export interface SuppliersRequest {
  first_name?: string;
  middle_name?: string;
  paternal_surname?: string;
  maternal_surname?: string;
  num_doc?: string;
  spouse_num_doc?: string;
  spouse_full_name?: string;
  direction?: string;
  email?: string;
  secondary_email?: string;
  phone?: string;
  secondary_phone?: string;
  secondary_phone_contact_name?: string;
  company_status?: string;
  company_condition?: string;
  supplier_tax_class_id?: string;
  type_person_id?: string;
  district_id?: string;
  document_type_id?: string;
  person_segment_id?: string;
  company_id?: number;
  type?: string;
}

export interface getSuppliersProps {
  params?: Record<string, any>;
}
