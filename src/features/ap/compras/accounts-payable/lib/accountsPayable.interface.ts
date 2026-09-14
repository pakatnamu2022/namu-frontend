export interface AccountPayableComment {
  id: number;
  comment: string;
  user_id: number | null;
  user: { id: number; name: string; sede: string } | null;
  created_at: string;
}

export interface AccountPayable {
  id: number;
  company: string;
  documento: string;
  proveedor_documento: string | null;
  proveedor_nombre: string | null;
  fecha_documento: string | null;
  fecha_contable: string | null;
  moneda: string;
  monto: string;
  monto_sin_aplicar: string;
  synced_at: string;
  comments_count?: number;
  comments?: AccountPayableComment[];
  created_at: string;
  updated_at: string;
}

export interface AccountsPayableMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AccountsPayableSummaryBreakdown {
  label: string;
  total_documents: number;
  total_amount: number;
  total_pending: number;
}

export interface AccountsPayableSummary {
  total_documents: number;
  total_amount: number;
  total_pending: number;
  breakdown?: AccountsPayableSummaryBreakdown[];
}

export interface AccountsPayableResponse {
  data: AccountPayable[];
  meta: AccountsPayableMeta;
  summary?: AccountsPayableSummary;
}

export interface DashboardChartDataset {
  label: string;
  data: number[];
}

export interface DashboardChart {
  id: string;
  title: string;
  type: "pie" | "bar" | "line";
  labels: string[];
  datasets: DashboardChartDataset[];
}

export interface DashboardSummary {
  total_documents: number;
  total_amount: number;
  total_pending: number;
}

export interface AccountsPayableDashboardResponse {
  synced_at: string;
  summary: DashboardSummary;
  charts: DashboardChart[];
}

export type DashboardFilters = Pick<AccountsPayableFilters, "moneda">;

export interface AccountsPayableFilters {
  search?: string;
  company?: string;
  moneda?: string;
  proveedor_documento?: string;
  "fecha_documento[from]"?: string;
  "fecha_documento[to]"?: string;
  "fecha_contable[from]"?: string;
  "fecha_contable[to]"?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}
