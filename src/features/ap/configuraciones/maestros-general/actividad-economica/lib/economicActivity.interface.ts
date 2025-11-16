import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface EconomicActivityResponse {
  data: EconomicActivityResource[];
  links: Links;
  meta: Meta;
}

export interface EconomicActivityResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface EconomicActivityRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getEconomicActivityProps {
  params?: Record<string, any>;
}
