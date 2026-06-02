export interface Sede {
  id: number;
  localidad: string;
  abreviatura: string;
}

export interface AccountReceivableComment {
  id: number;
  comment: string;
  sede_id: number;
  sede: Sede;
  user_id: number;
  user: { id: number; name: string };
  created_at: string;
}

export interface AccountReceivable {
  id: number;
  company: string;
  sede_id: number;
  sede: Sede;
  seller: string;
  cashier: string;
  document_number: string;
  client_id: string;
  client_name: string;
  client_id_real: string | null;
  client_name_real: string | null;
  document_date: string;
  document_due_date: string;
  due_year: number;
  due_month: string;
  overdue_days: number;
  overdue_status: string;
  currency: string;
  exchange_rate: string;
  amount: string;
  balance: string;
  branch: string;
  observations: string | null;
  collection_date: string | null;
  synced_at: string;
  comments_count?: number;
  comments?: AccountReceivableComment[];
  created_at: string;
  updated_at: string;
}

export interface AccountsReceivableMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AccountsReceivableResponse {
  data: AccountReceivable[];
  meta: AccountsReceivableMeta;
}

export interface FilterTreeStatus {
  status: string;
  years: number[];
}

export interface FilterTreeNode {
  sede_id: number;
  sede_name: string;
  statuses: FilterTreeStatus[];
}

export interface AccountsReceivableFilters {
  search?: string;
  sede_id?: number | string | null;
  year?: number | string | null;
  company?: string;
  currency?: string;
  overdue_status?: string;
  seller?: string;
  "document_date[from]"?: string;
  "document_date[to]"?: string;
  "document_due_date[from]"?: string;
  "document_due_date[to]"?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}
