import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface TransferReceptionDetailResource {
  id: number;
  transfer_reception_id?: number;
  transfer_item_id?: number;
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
  batch_number?: string;
  expiration_date?: string;
  notes?: string;
  product?: {
    id: number;
    code: string;
    name: string;
    brand_name?: string;
    category_name?: string;
    unit_measurement_name?: string;
    cost_price?: string | number;
    sale_price?: string | number;
  };
  transfer_item?: {
    id: number;
    product_id: number;
    product_name?: string;
    quantity: number;
    unit_cost?: number;
  };
}

export interface TransferReceptionResource {
  id: number;
  reception_number?: string;
  product_transfer_id: number;
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
  product_transfer?: {
    id: number;
    reference?: {
      document_series_id?: number;
    };
    warehouse_origin?: {
      id: number;
      description: string;
      sede?: string;
    };
    warehouse_destination?: {
      id: number;
      description: string;
      sede?: string;
    };
    movement_date?: string;
    details?: Array<{
      id: number;
      product_id: number;
      product?: {
        id: number;
        description: string;
        code?: string;
      };
      quantity: number;
      unit_cost: number;
    }>;
  };
  warehouse?: {
    id: number;
    description: string;
  };
  details?: TransferReceptionDetailResource[];
  created_at?: string;
  updated_at?: string;
}

// Interface para el listado (datos resumidos)
export interface TransferReceptionListItem {
  id: number;
  reception_number?: string;
  product_transfer_id: number;
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

export interface TransferReceptionResponse {
  data: TransferReceptionListItem[];
  links: Links;
  meta: Meta;
}

export interface TransferReceptionDetailRequest {
  transfer_item_id?: string;
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

export interface TransferReceptionRequest {
  product_transfer_id: string;
  reception_date: string | Date;
  warehouse_id: string;
  shipping_guide_number?: string;
  notes?: string;
  details: TransferReceptionDetailRequest[];
}

export interface getTransferReceptionsProps {
  params?: Record<string, any>;
  productTransferId?: number;
}
