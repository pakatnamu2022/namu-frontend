import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface WorkOrderPartsResponse {
  data: WorkOrderPartsResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderPartsResource {
  id: number;
  work_order_id: number;
  work_order_correlative: string;
  group_number: number;
  product_id: string;
  product_name: string;
  product_code?: string;
  product_dyn_code: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity_used: number;
  is_delivered: boolean;
  registered_by_name: string;
  unit_price?: string;
  total_cost?: string;
  tax_amount?: string;
  discount_percentage: number;
  net_amount?: string;
}

export interface WorkOrderPartsRequest {
  id?: number;
  work_order_id: number;
  group_number: number;
  product_id: string | number;
  warehouse_id: string | number;
  quantity_used: number;
  unit_price?: number;
  discount_percentage?: number;
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

export interface WorkOrderPartDeliveryResource {
  id: number;
  work_order_part_id: number;
  delivered_to: number;
  delivered_to_name: string;
  delivered_quantity: number;
  delivered_date: string;
  delivered_by: number;
  delivered_by_name: string;
  is_received: boolean;
  received_date: string | null;
  received_signature_url: string | null;
  received_by: number | null;
  received_by_name: string | null;
}

export interface WorkOrderPartAssignment {
  delivery_id: number;
  work_order_part_id: number;
  product: {
    id: number;
    code: string;
    name: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
  technician: {
    id: number;
    name: string;
    worker_id: number;
  };
  delivered_quantity: string;
  delivered_date: string;
  delivered_by: {
    id: number;
    name: string;
  };
  is_received: boolean;
  received_date: string | null;
  received_by: {
    id: number;
    name: string;
  } | null;
  received_signature_url: string | null;
}

export interface WorkOrderPartAssignmentsResponse {
  work_order_id: number;
  total_assignments: number;
  assignments: WorkOrderPartAssignment[];
}

export interface ConfirmPartsDeliveryRequest {
  delivery_ids: number[];
}
