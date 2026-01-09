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

// Interfaces para la cotización con productos
export interface QuotationProduct {
  id: number;
  order_quotation_id: number;
  item_type: string;
  product_id: number;
  description: string;
  purchase_price: string | null;
  retail_price_external: string;
  flete_external: string;
  percentage_flete_external: string;
  quantity: string;
  unit_measure: string;
  unit_price: string;
  discount: string;
  total_amount: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: {
    id: number;
    code: string;
    dyn_code: string;
    nubefac_code: string;
    name: string;
    description: string;
    product_category_id: number;
    brand_id: number;
    unit_measurement_id: number;
    ap_class_article_id: number;
    cost_price: string;
    sale_price: string;
    tax_rate: string;
    is_taxable: boolean;
    sunat_code: string;
    warranty_months: number | null;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

export interface QuotationByVehicleResponse {
  id: number;
  vehicle_id: number;
  sede_id: number;
  quotation_number: string;
  subtotal: string;
  discount_percentage: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  validity_days: number;
  quotation_date: string;
  expiration_date: string;
  observations: string;
  is_take: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  details: QuotationProduct[];
  vehicle: any;
  sede: any;
  created_by: any;
}

export interface StoreBulkFromQuotationRequest {
  quotation_id: number;
  work_order_id: number;
  warehouse_id: number;
  group_number: number;
  quotation_detail_ids: number[];
}
