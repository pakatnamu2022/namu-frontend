import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface HotelAgreementResponse {
  data: HotelAgreementResource[];
  links: Links;
  meta: Meta;
}

export interface HotelAgreementResource {
  id: number;
  ruc: string;
  city: string;
  name: string;
  corporate_rate: string;
  features: string;
  includes_breakfast: boolean;
  includes_lunch: boolean;
  includes_dinner: boolean;
  includes_parking: boolean;
  email: string;
  phone: string;
  address: string;
  website: string;
  active: boolean;
}

export interface HotelAgreementRequest {
  city: string;
  name: string;
  corporate_rate: number;
  features: string;
  includes_breakfast: boolean;
  includes_parking: boolean;
  contact: string;
  address: string;
  website: string;
}

export interface getHotelAgreementProps {
  params?: Record<string, any>;
}
