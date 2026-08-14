import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface SupportsResponse {
  data: SupportsResource[];
  links: Links;
  meta: Meta;
}

export interface SupportsResource {
  id: number;
  activity_id: number | null;
  activity?: { id: number; name: string } | null;
  purchase_order_id: number | null;
  purchase_order?: { id: number; number: string | null } | null;
  type: string;
  type_label?: string | null;
  document_series: string | null;
  document_number: string | null;
  issue_date: string | null;
  supplier_id: number | null;
  supplier?: { id: number; full_name: string } | null;
  currency_id: number | null;
  currency?: { id: number; name: string; symbol: string } | null;
  amount: number | null;
  file_path: string | null;
  notes: string | null;
}

export interface getSupportsProps {
  params?: Record<string, any>;
}
