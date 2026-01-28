import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface PurchaseOrderProductsResponse {
  data: PurchaseOrderProductsResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseOrderProductItemResource {
  id: number;
  description?: string;
  unit_price: number;
  quantity: number;
  total: number;
  is_vehicle: boolean;
  unit_measurement?: string | null;
  product_id: number;
  product_name?: string;
  product_code?: string;
}

export interface PurchaseOrderProductsResource {
  id: number;
  number: string;
  number_guide?: string;
  invoice_series: string;
  invoice_number: string;
  emission_date: string;
  due_date: string;
  subtotal: number;
  igv: number;
  total: number;
  discount: number;
  isc: number;
  sede_id: number;
  sede?: string;
  supplier: string;
  supplier_num_doc?: string;
  supplier_order_type?: string;
  currency?: string;
  currency_code?: string;
  warehouse?: string;
  vehicle?: any;
  payment_terms?: string;
  items: PurchaseOrderProductItemResource[];
  supplier_id: number;
  supplier_order_type_id: number;
  currency_id: number;
  warehouse_id?: number;
  resent: boolean;
  status: boolean;
  migration_status: string;
  invoice_dynamics?: string | null;
  receipt_dynamics?: string | null;
  credit_note_dynamics?: string | null;
  vehicleMovement?: any;
  has_receptions?: boolean;
  migrated_at?: string | null;
  notes?: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
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
  supplier_id: string;
  payment_terms?: string;
  shipping_method?: string;
  warehouse_id?: string;
  subtotal: number;
  total_discount?: number;
  total_tax?: number;
  total: number;
  status: "PENDING" | "APPROVED" | "RECEIVED" | "CANCELLED";
  notes?: string;
  items: PurchaseOrderProductItemRequest[];
}

export interface getPurchaseOrderProductsProps {
  params?: Record<string, any>;
}
