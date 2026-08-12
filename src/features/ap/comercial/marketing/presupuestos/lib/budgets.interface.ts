import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface BudgetsResponse {
  data: BudgetsResource[];
  links: Links;
  meta: Meta;
}

export interface BudgetsResource {
  id: number;
  plan_id: number;
  plan?: { id: number; name: string } | null;
  type: string;
  type_label?: string | null;
  period_month: number | null;
  currency_id: number;
  currency?: { id: number; name: string; symbol: string } | null;
  amount_estimated: number;
  status: string | null;
  status_label?: string | null;
  notes: string | null;
}

export interface FundingResource {
  id: number;
  budget_id: number;
  source: string;
  currency_id: number;
  amount: number;
  notes: string | null;
}

export interface getBudgetsProps {
  params?: Record<string, any>;
}
