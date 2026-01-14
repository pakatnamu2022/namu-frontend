import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface WorkOrderPartsResponse {
  data: WorkOrderPartsResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderPartsResource {
  id: number;
  work_order_id: number;
  group_number: number;
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity_used: number;
  is_delivered: boolean;
  registered_by_name: string;
  unit_price?: string;
  subtotal?: string;
  tax_amount?: string;
  total_amount?: string;
}

export interface WorkOrderPartsRequest {
  id: number;
  work_order_id: number;
  group_number: number;
  product_id: string;
  warehouse_id: string;
  quantity_used: number;
}

export interface getWorkOrderPartsProps {
  params?: Record<string, any>;
}

export interface StoreBulkFromQuotationRequest {
  quotation_id: number;
  work_order_id: number;
  warehouse_id: number;
  group_number: number;
  quotation_detail_ids: number[];
}
