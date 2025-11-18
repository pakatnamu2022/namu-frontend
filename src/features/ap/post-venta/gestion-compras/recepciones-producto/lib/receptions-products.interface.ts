import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ReceptionDetailResource {
  id: number;
  reception_id: number;
  purchase_order_item_id?: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected?: number;
  reception_type: "ORDERED" | "BONUS" | "GIFT" | "SAMPLE";
  unit_cost?: number;
  is_charged?: boolean;
  rejection_reason?:
    | "DAMAGED"
    | "DEFECTIVE"
    | "EXPIRED"
    | "WRONG_PRODUCT"
    | "WRONG_QUANTITY"
    | "POOR_QUALITY"
    | "OTHER";
  rejection_notes?: string;
  bonus_reason?: string;
  batch_number?: string;
  expiration_date?: string;
  notes?: string;
}

export interface ReceptionResource {
  id: number;
  purchase_order_id: number;
  purchase_order_number?: string;
  reception_date: string;
  warehouse_id: number;
  warehouse_name?: string;
  supplier_invoice_number?: string;
  supplier_invoice_date?: string;
  shipping_guide_number?: string;
  notes?: string;
  received_by?: number;
  received_by_name?: string;
  details?: ReceptionDetailResource[];
  created_at?: string;
  updated_at?: string;
}

export interface ReceptionResponse {
  data: ReceptionResource[];
  links: Links;
  meta: Meta;
}

export interface ReceptionDetailRequest {
  purchase_order_item_id?: string;
  product_id: string;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected?: number;
  reception_type: "ORDERED" | "BONUS" | "GIFT" | "SAMPLE";
  unit_cost?: number;
  is_charged?: boolean;
  rejection_reason?:
    | "DAMAGED"
    | "DEFECTIVE"
    | "EXPIRED"
    | "WRONG_PRODUCT"
    | "WRONG_QUANTITY"
    | "POOR_QUALITY"
    | "OTHER";
  rejection_notes?: string;
  bonus_reason?: string;
  batch_number?: string;
  expiration_date?: string;
  notes?: string;
}

export interface ReceptionRequest {
  purchase_order_id: string;
  reception_date: string;
  warehouse_id: string;
  supplier_invoice_number?: string;
  supplier_invoice_date?: string;
  shipping_guide_number?: string;
  notes?: string;
  received_by?: string;
  details: ReceptionDetailRequest[];
}

export interface getReceptionsProps {
  params?: Record<string, any>;
  purchaseOrderId?: number;
}
