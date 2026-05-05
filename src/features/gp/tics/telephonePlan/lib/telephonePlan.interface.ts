import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface TelephonePlanResponse {
  data: TelephonePlanResource[];
  links: Links;
  meta: Meta;
}

export interface TelephonePlanResource {
  id: string;
  name: string;
  price: string;
  description?: string;
}

export interface TelephonePlanRequest {
  name: string;
  price: number;
  description: string;
}

export interface getTelephonePlansProps {
  params?: Record<string, any>;
}
