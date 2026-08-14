import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PurchaseOrdersResponse {
  data: PurchaseOrdersResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseOrdersResource {
  id: number;
  activity_id: number | null;
  activity?: { id: number; name: string } | null;
  proposal_id: number | null;
  proposal?: { id: number } | null;
  supplier_id: number;
  supplier?: { id: number; full_name: string } | null;
  currency_id: number;
  currency?: { id: number; name: string; symbol: string } | null;
  number: string | null;
  amount: number;
  issue_date: string | null;
  status: string | null;
  status_label?: string | null;
  sent_at: string | null;
  billed_at: string | null;
  electronic_document_id?: number | null;
  electronic_document?: {
    id: number;
    full_number: string;
    status: string;
    pdf_url?: string | null;
  } | null;
  notes: string | null;
}

export interface getPurchaseOrdersProps {
  params?: Record<string, any>;
}
