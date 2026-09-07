import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type AdjustmentAction = "create" | "update" | "delete";
export type AdjustmentStatus = "pending" | "approved" | "rejected";
export type AdjustmentItemType = "bonus_discount" | "gift";

export interface AdjustmentItemResource {
  id: number;
  action: AdjustmentAction;
  item_type: AdjustmentItemType;
  discount_coupon_id: number | null;
  concept_code_id: number | null;
  concept_code: string | null;
  type: "FIJO" | "PORCENTAJE" | null;
  is_negative: boolean;
  has_retention: boolean;
  accessory_detail_id: number | null;
  approved_accessory_id: number | null;
  accessory_label: string | null;
  quantity: number | null;
  additional_price: number | null;
  previous_valor_unitario: number | null;
  new_valor_unitario: number | null;
  previous_precio_unitario: number | null;
  new_precio_unitario: number | null;
}

export interface AdjustmentRequestResource {
  id: number;
  purchase_request_quote_id: number;
  quote_correlative: string | null;
  holder_name: string | null;
  currency_symbol: string;
  requested_by_id: number;
  requested_by_name: string | null;
  status: AdjustmentStatus;
  reason: string | null;
  margin_amount_before: number;
  margin_pct_before: number;
  margin_amount_after: number;
  margin_pct_after: number;
  resolved_by_id: number | null;
  resolved_by_name: string | null;
  resolved_at: string | null;
  rejection_reason: string | null;
  items: AdjustmentItemResource[];
  created_at: string;
}

export interface AdjustmentRequestResponse {
  data: AdjustmentRequestResource[];
  links: Links;
  meta: Meta;
}

export interface AdjustmentItemPayload {
  action: AdjustmentAction;
  item_type: AdjustmentItemType;
  // Bono / descuento
  discount_coupon_id?: number | null;
  concept_code_id?: number | null;
  type?: "FIJO" | "PORCENTAJE" | null;
  value?: number;
  has_retention?: boolean;
  // Obsequio
  accessory_detail_id?: number | null;
  approved_accessory_id?: number | null;
  quantity?: number | null;
  additional_price?: number | null;
}

export interface CreateAdjustmentRequestPayload {
  purchase_request_quote_id: number;
  reason?: string;
  items: AdjustmentItemPayload[];
}

export interface getAdjustmentRequestProps {
  params?: Record<string, any>;
}
