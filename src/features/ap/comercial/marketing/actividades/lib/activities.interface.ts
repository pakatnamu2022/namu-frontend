import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ActivitiesResponse {
  data: ActivitiesResource[];
  links: Links;
  meta: Meta;
}

export interface ActivitiesResource {
  id: number;
  budget_id: number;
  budget?: { id: number; type: string } | null;
  activity_type: string;
  name: string;
  description: string | null;
  objective: string | null;
  responsible: string | null;
  channel: string | null;
  start_date: string | null;
  end_date: string | null;
  currency_id: number;
  currency?: { id: number; name: string; symbol: string } | null;
  estimated_amount: number;
  supplier_id: number | null;
  supplier?: { id: number; full_name: string } | null;
  status: string | null;
  status_label?: string | null;
  notes: string | null;
}

export interface ActivityLocationResource {
  id: number;
  activity_id: number;
  sede_id: number | null;
  location_name: string | null;
  currency_id: number | null;
  amount: number | null;
  notes: string | null;
}

export interface getActivitiesProps {
  params?: Record<string, any>;
}
