import { Links, Meta } from "@/shared/lib/pagination.interface";

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
