import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ReceptionDetailResource {
  id: number;
  purchase_reception_id?: number;
  purchase_order_item_id?: number;
  product_id: number;
  quantity_received: string | number;
  observed_quantity?: string | number;
  reception_type: "ORDERED" | "BONUS" | "GIFT" | "SAMPLE";
  reason_observation?:
    | "DAMAGED"
    | "DEFECTIVE"
    | "EXPIRED"
    | "WRONG_PRODUCT"
    | "WRONG_QUANTITY"
    | "POOR_QUALITY"
    | "OTHER";
  observation_notes?: string;
  bonus_reason?: string;
  notes?: string;
  product?: {
    id: number;
    code: string;
    name: string;
  };
  purchase_order_item?: {
    id: number;
    product_id: number;
    product_name?: string;
    quantity: number;
  };
}

export interface ReceptionResource {
  id: number;
  reception_number?: string;
  purchase_order_id: number;
  reception_date: string;
  warehouse_id: number;
  shipping_guide_number?: string;
  reception_type?: string;
  notes?: string;
  received_by?: number;
  received_by_user_name?: string;
  total_items?: number;
  total_quantity?: string;
  status?: string;
  purchase_order?: {
    id: number;
    number: string;
    supplier?: string;
    items?: Array<{
      id: number;
      product_id: number;
      product_name?: string;
      quantity: number;
      unit_price: number;
    }>;
  };
  warehouse?: {
    id: number;
    description: string;
  };
  details?: ReceptionDetailResource[];
  created_at?: string;
  updated_at?: string;
}

// Interface para el listado (datos resumidos)
export interface ReceptionListItem {
  id: number;
  reception_number?: string;
  purchase_order_id: number;
  reception_date: string;
  warehouse_id: number;
  shipping_guide_number?: string;
  reception_type?: string;
  notes?: string;
  received_by?: number;
  received_by_user_name?: string;
  total_items?: number;
  total_quantity?: string;
  status?: string;
}

export interface ReceptionResponse {
  data: ReceptionListItem[];
  links: Links;
  meta: Meta;
}

export interface ReceptionDetailRequest {
  purchase_order_item_id?: string;
  product_id: string;
  quantity_received: number;
  observed_quantity?: number;
  reception_type: "ORDERED" | "BONUS" | "GIFT" | "SAMPLE";
  reason_observation?:
    | "DAMAGED"
    | "DEFECTIVE"
    | "EXPIRED"
    | "WRONG_PRODUCT"
    | "WRONG_QUANTITY"
    | "POOR_QUALITY"
    | "OTHER";
  observation_notes?: string;
  bonus_reason?: string;
  notes?: string;
}

export interface ReceptionRequest {
  purchase_order_id: string;
  reception_date: string | Date;
  warehouse_id: string;
  shipping_guide_number?: string;
  notes?: string;
  details: ReceptionDetailRequest[];
}

export interface getReceptionsProps {
  params?: Record<string, any>;
  purchaseOrderId?: number;
}
