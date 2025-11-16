import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface CustomersResponse {
  data: CustomersResource[];
  links: Links;
  meta: Meta;
}

export interface CustomersResource {
  id: number;
  first_name: string;
  middle_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  full_name: string;
  birth_date: string | null;
  nationality: string;
  num_doc: string;
  spouse_num_doc: string | null;
  spouse_full_name: string | null;
  direction: string;
  legal_representative_num_doc: string | null;
  legal_representative_name: string | null;
  legal_representative_paternal_surname: string | null;
  legal_representative_maternal_surname: string | null;
  legal_representative_full_name: string | null;
  email: string;
  secondary_email: string | null;
  phone: string;
  secondary_phone: string | null;
  secondary_phone_contact_name: string | null;
  driver_num_doc: string | null;
  driver_full_name: string | null;
  driving_license: string | null;
  driving_license_expiration_date: Date | "";
  status_license?: string;
  restriction?: string;
  company_status?: string;
  company_condition?: string;
  origin_id: string;
  tax_class_type_id: string;
  tax_class_type?: string;
  tax_class_type_igv?: number;
  supplier_tax_class_type?: string;
  supplier_tax_class_type_igv?: number;
  type_person_id: string;
  district_id: string;
  document_type_id: string;
  person_segment_id: string;
  marital_status_id: string;
  gender_id: string;
  activity_economic_id: string;
  company_id: number;
  type: string;
  driving_license_category: string | null;
}

export interface CustomersRequest {
  first_name?: string;
  middle_name?: string;
  paternal_surname?: string;
  maternal_surname?: string;
  birth_date?: string | Date;
  nationality?: string;
  num_doc?: string;
  spouse_num_doc?: string;
  spouse_full_name?: string;
  direction?: string;
  legal_representative_num_doc?: string;
  legal_representative_name?: string;
  legal_representative_paternal_surname?: string;
  legal_representative_maternal_surname?: string;
  legal_representative_full_name?: string;
  email?: string;
  secondary_email?: string;
  phone?: string;
  secondary_phone?: string;
  secondary_phone_contact_name?: string;
  driver_num_doc?: string;
  driver_full_name?: string;
  driving_license?: string;
  driving_license_expiration_date?: Date | "";
  status_license?: string;
  restriction?: string;
  company_status?: string;
  company_condition?: string;
  origin_id?: string;
  tax_class_type_id?: string;
  type_person_id?: string;
  district_id?: string;
  document_type_id?: string;
  person_segment_id?: string;
  marital_status_id?: string;
  gender_id?: string;
  activity_economic_id?: string;
  company_id?: number;
  type?: string;
  driving_license_category?: string;
}

export interface getCustomersProps {
  params?: Record<string, any>;
}
