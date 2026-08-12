import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ProposalsResponse {
  data: ProposalsResource[];
  links: Links;
  meta: Meta;
}

export interface ProposalsResource {
  id: number;
  activity_id: number;
  activity?: { id: number; name: string } | null;
  supplier_id: number;
  supplier?: { id: number; full_name: string } | null;
  currency_id: number;
  currency?: { id: number; name: string; symbol: string } | null;
  amount: number;
  description: string | null;
  status: string | null;
  status_label?: string | null;
  notes: string | null;
  reviewed_by: number | null;
  reviewed_by_user?: { id: number; name: string } | null;
  reviewed_at: string | null;
}

export interface getProposalsProps {
  params?: Record<string, any>;
}
