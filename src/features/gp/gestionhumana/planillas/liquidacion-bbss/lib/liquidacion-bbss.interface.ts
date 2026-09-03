import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface LiquidacionBbssResponse {
  data: LiquidacionBbssResource[];
  links: Links;
  meta: Meta;
}

export interface LiquidacionBbssResource {
  id: number;
  worker_id: number;
  worker: string | null;
  period_id: number;
  period: string | null;
  amount: number;
  type: string | null;
  type_id: number;
  status: boolean;
}

export interface LiquidacionBbssRequest {
  worker_id: number;
  period_id: number;
  amount: number;
  type_id: number;
  status: boolean;
}

export interface LiquidacionBbssConceptColumn {
  code: string;
  label: string;
}

export interface LiquidacionBbssPivotRow {
  worker_id: number;
  worker: string | null;
  worker_vat: string | null;
  period_id: number;
  period: string | null;
  amounts: Record<string, number>;
  ids: Record<string, number>;
  total: number;
}

export interface LiquidacionBbssPivotResponse {
  data: LiquidacionBbssPivotRow[];
  columns: LiquidacionBbssConceptColumn[];
}
