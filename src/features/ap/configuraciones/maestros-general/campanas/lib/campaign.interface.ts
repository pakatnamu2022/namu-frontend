import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface CampaignResponse {
  data: CampaignResource[];
  links: Links;
  meta: Meta;
}

export interface CampaignArea {
  id: number;
  description: string;
  type: string;
}

export type DiscountType = "fixed" | "percentage";

export interface CampaignResource {
  id: number;
  area_id: number;
  area: CampaignArea | null;
  code: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  discount_type: DiscountType;
  discount_value: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignRequest {
  area_id: number;
  code: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  discount_type: DiscountType;
  discount_value: number;
  status: boolean;
}

export interface getCampaignProps {
  params?: Record<string, any>;
}

export interface getActiveCampaignProps {
  params?: Record<string, any>;
}
