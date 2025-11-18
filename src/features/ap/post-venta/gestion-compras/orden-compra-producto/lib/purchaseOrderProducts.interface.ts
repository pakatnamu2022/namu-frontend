import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PurchaseOrderProductsResponse {
  data: PurchaseOrderProductsResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseOrderProductItemResource {
  id: number;
  purchase_order_id: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
  subtotal: number;
  total: number;
  notes?: string;
}

export interface PurchaseOrderProductsResource {
  id: number;
  order_number: string;
  supplier_id: number;
  supplier_name?: string;
  supplier_num_doc?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  payment_terms?: string;
  shipping_method?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  subtotal: number;
  total_discount?: number;
  total_tax?: number;
  total_amount: number;
  status: "PENDING" | "APPROVED" | "RECEIVED" | "CANCELLED";
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  received_by?: number;
  received_by_name?: string;
  received_at?: string;
  items?: PurchaseOrderProductItemResource[];
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderProductItemRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
  notes?: string;
}

export interface PurchaseOrderProductsRequest {
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  payment_terms?: string;
  shipping_method?: string;
  warehouse_id?: string;
  subtotal: number;
  total_discount?: number;
  total_tax?: number;
  total_amount: number;
  status: "PENDING" | "APPROVED" | "RECEIVED" | "CANCELLED";
  notes?: string;
  items: PurchaseOrderProductItemRequest[];
}

export interface getPurchaseOrderProductsProps {
  params?: Record<string, any>;
}
