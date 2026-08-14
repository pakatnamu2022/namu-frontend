import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface KpisResponse {
  data: KpisResource[];
  links: Links;
  meta: Meta;
}

export interface KpisResource {
  id: number;
  activity_id: number;
  activity?: { id: number; name: string } | null;
  period_month: number | null;
  period_year: number | null;
  leads: number | null;
  sales: number | null;
  investment: number | null;
  currency_id: number | null;
  currency?: { id: number; name: string; symbol: string } | null;
  notes: string | null;
}

export interface getKpisProps {
  params?: Record<string, any>;
}
