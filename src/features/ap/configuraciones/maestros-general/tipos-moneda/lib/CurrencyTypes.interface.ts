import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface CurrencyTypesResponse {
  data: CurrencyTypesResource[];
  links: Links;
  meta: Meta;
}

export interface CurrencyTypesResource {
  id: number;
  code: string;
  name: string;
  symbol: string;
  status: boolean;
  current_exchange_rate?: number;
}

export interface CurrencyTypesRequest {
  code: string;
  name: string;
  symbol: string;
  status: boolean;
}

export interface getCurrencyTypesProps {
  params?: Record<string, any>;
}
