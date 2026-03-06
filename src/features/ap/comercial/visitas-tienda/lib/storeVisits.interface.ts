import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface StoreVisitsResponse {
  data: StoreVisitsResource[];
  links: Links;
  meta: Meta;
}

export interface StoreVisitsResource {
  id: number;
  registration_date: Date | "";
  model: string;
  version: string;
  num_doc: string;
  full_name: string;
  phone: string;
  email?: string;
  campaign: string;
  worker_id?: number;
  worker?: string;
  sede_id?: number;
  vehicle_brand_id?: number;
  document_type_id?: number;
  income_sector_id?: number;
  type: string;
  sede: string;
  vehicle_brand: string;
  document_type: string;
  income_sector: string;
  area_id: number;
  district: string;
  status_num_doc: string;
  client_id?: number;
  use: string;
  created_at: string;
}

export interface StoreVisitsRequest {
  registration_date: Date | "";
  model: string;
  version: string;
  num_doc: string;
  full_name: string;
  phone: string;
  email: string;
  campaign: string;
  type: string;
  income_sector_id: string;
  sede_id: string;
  worker_id: string;
  vehicle_brand_id: string;
  document_type_id: string;
  area_id: string;
}

export interface getStoreVisitsProps {
  params?: Record<string, any>;
}
