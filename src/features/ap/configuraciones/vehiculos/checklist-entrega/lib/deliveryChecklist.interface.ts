import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface DeliveryChecklistResponse {
  data: DeliveryChecklistResource[];
  links: Links;
  meta: Meta;
}

export interface DeliveryChecklistResource {
  id: number;
  description: string;
  type: string;
  category_id: number;
  has_quantity: boolean;
  status: boolean;
}

export interface DeliveryChecklistRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getDeliveryChecklistProps {
  params?: Record<string, any>;
}
