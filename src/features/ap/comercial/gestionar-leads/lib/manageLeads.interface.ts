import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ManageLeadsResponse {
  data: ManageLeadsResource[];
  links: Links;
  meta: Meta;
}

export interface ManageLeadsResource {
  id: number;
  registration_date: string;
  model: string;
  version: string;
  num_doc: string;
  full_name: string;
  phone: string;
  email: string;
  campaign: string;
  worker_id: number;
  worker: string;
  sede_id: number;
  vehicle_brand_id: number;
  document_type_id: number;
  income_sector_id: number;
  type: string;
  sede: string;
  vehicle_brand: string;
  document_type: string;
  income_sector: string;
  area_id: number;
  district: string;
  status_num_doc: string;
  client_id?: number;
}

export interface ManageLeadsRequest {
  registration_date: Date | "";
  model: string;
  version: string;
  num_doc: string;
  name: string;
  surnames: string;
  phone: string;
  email: string;
  campaign: string;
  type: string;
  income_sector_id: number;
  sede_id: number;
  vehicle_brand_id: number;
  document_type_id: number;
  area_id: number;
}

export interface getManageLeadsProps {
  params?: Record<string, any>;
}

export interface ImportedLeadResource {
  registration_date: string;
  model: string;
  version: string;
  num_doc: string;
  full_name: string;
  phone: string;
  email: string;
  campaign: string;
  sede_id: number;
  vehicle_brand_id: number;
  document_type_id: number;
  type: string;
  income_sector_id: number;
  area_id: number;
  district: string;
  vehicle_brand: string;
  sede: string;
  worker_name: string;
}

export interface ImportLeadsResponse {
  success: boolean;
  message: string;
  data: ImportedLeadResource[];
}

export interface AssignWorkersResponse {
  success: boolean;
  message: string;
}
