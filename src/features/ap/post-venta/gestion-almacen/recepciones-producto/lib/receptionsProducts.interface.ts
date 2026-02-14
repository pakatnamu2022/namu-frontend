import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { ProductResource } from "../../productos/lib/product.interface";

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
  batch_number?: string;
  expiration_date?: string;
  notes?: string;
  product?: ProductResource;
}

export interface ReceptionResource {
  id: number;
  reception_number?: string;
  supplier_id: number;
  supplier_num_doc: string;
  supplier_name: string;
  type_currency_id: number;
  ap_supplier_order_id: number;
  reception_date: string;
  warehouse_id: number;
  freight_cost: number;
  shipping_guide_number?: string;
  reception_type?: string;
  notes?: string;
  received_by?: number;
  received_by_user_name?: string;
  total_items?: number;
  total_quantity?: string;
  status?: string;
  has_invoice?: boolean;
  purchase_order?: VehiclePurchaseOrderResource;
  warehouse: WarehouseResource;
  carrier: SuppliersResource;
  details?: ReceptionDetailResource[];
  created_at?: string;
  updated_at?: string;
}

// Interface para el listado (datos resumidos)
export interface ReceptionListItem {
  id: number;
  reception_number?: string;
  ap_supplier_order_id: number;
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
  ap_supplier_order_id: string;
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
