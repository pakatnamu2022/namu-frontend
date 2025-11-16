import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface ReceptionChecklistResponse {
  data: ReceptionChecklistResource[];
  links: Links;
  meta: Meta;
}

export interface ReceptionChecklistResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
  has_quantity: boolean;
  category_id: number;
}

export interface ReceptionChecklistRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getReceptionChecklistProps {
  params?: Record<string, any>;
}
