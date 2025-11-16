import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface EstablishmentsResponse {
  data: EstablishmentsResource[];
  links: Links;
  meta: Meta;
}

export interface EstablishmentsResource {
  id: number;
  code: string;
  description: string;
  type: string;
  activity_economic: string;
  address: string;
  full_address: string;
  ubigeo: string;
  location: string | null;
  business_partner_id: number;
  sede_id: string | null;
  department_id?: string;
  province_id?: string;
  district_id?: string;
  status: boolean;
}

export interface getEstablishmentsProps {
  params?: Record<string, any>;
}
